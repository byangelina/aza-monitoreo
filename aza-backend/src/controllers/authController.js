const crypto=require('crypto');
const sequelize=require('../config/database');
const tokenHash=value=>crypto.createHash('sha256').update(value).digest('hex');
const { Usuario, Rol } = require('../models');
const { hashPassword, verifyPassword, passwordPolicyError } = require('../utils/password');
const { signAccessToken, revokeToken, signResetToken, verifyResetToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/mailer');
const { registrarAuditoria } = require('../utils/auditLogger');
const env = require('../config/env');

const GENERIC_LOGIN_ERROR = 'Credenciales incorrectas. Revisa los datos e inténtalo otra vez.'; // RNF009

function toPublicUser(usuario) {
  return {
    id: usuario.idUsuario,
    nombre: usuario.nombreCompleto,
    correo: usuario.correo,
    rol: usuario.rol?.nombreRol,
    debeCambiarPassword: usuario.debeCambiarPassword,
  };
}

async function login(req, res) {
  const { correo, password } = req.body;
  if (typeof correo!=='string' || typeof password!=='string' || !correo || !password) return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });

  const usuario = await Usuario.findOne({ where: { correo: String(correo).trim().toLowerCase() }, include: { model: Rol, as: 'rol' } });

  // RNF009: no revelar si la cuenta existe o está inactiva; mismo mensaje genérico.
  if (!usuario || !usuario.estado) return res.status(401).json({ error: GENERIC_LOGIN_ERROR });

  if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
    const minutos = Math.ceil((usuario.bloqueadoHasta - new Date()) / 60000);
    return res.status(423).json({ error: `Cuenta bloqueada temporalmente. Intenta nuevamente en ${minutos} minuto(s).` });
  }

  const passwordOk = await verifyPassword(password, usuario.passwordHash);
  if (!passwordOk) {
    // RNF003: bloqueo tras intentos fallidos consecutivos, persistido en BD (no en memoria del cliente).
    usuario.intentosFallidos += 1;
    if (usuario.intentosFallidos >= env.auth.lockAttempts) {
      usuario.bloqueadoHasta = new Date(Date.now() + env.auth.lockMinutes * 60000);
      usuario.intentosFallidos = 0;
    }
    await usuario.save();
    return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
  }

  usuario.intentosFallidos = 0;
  usuario.bloqueadoHasta = null;
  await usuario.save();

  const token = signAccessToken(usuario);
  await registrarAuditoria({ accion: 'Inicio de sesión', tabla: 'usuario', idUsuario: usuario.idUsuario, ip: req.ip });

  res.json({ token, user: toPublicUser(usuario) });
}

async function logout(req, res) {
  revokeToken(req.tokenPayload);
  await req.usuario.increment('sessionVersion');
  await registrarAuditoria({ accion: 'Cierre de sesión', tabla: 'usuario', idUsuario: req.usuario.idUsuario, ip: req.ip });
  res.status(204).send();
}

async function me(req, res) {
  res.json({ user: toPublicUser(req.usuario) });
}

async function recuperar(req, res) {
  const { correo } = req.body;
  if (typeof correo!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return res.status(400).json({ error: 'Indica un correo electrónico.' });

  const usuario = await Usuario.findOne({ where: { correo: String(correo).trim().toLowerCase() } });

  let previewUrl = null;
  if (usuario && usuario.estado) {
    const token = signResetToken(usuario);
    const decoded=verifyResetToken(token);
    await usuario.update({resetTokenHash:tokenHash(token),resetExpiresAt:new Date(decoded.exp*1000)});
    const link = `${env.frontendUrl}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
    const result = await sendPasswordResetEmail(usuario.correo, link);
    previewUrl = result.previewUrl;
    await registrarAuditoria({ accion: 'Solicitud de recuperación de contraseña', tabla: 'usuario', idUsuario: usuario.idUsuario, ip: req.ip });
  }

  // RNF009: la respuesta es idéntica exista o no la cuenta, para no revelar información.
  res.json({
    message: 'Si el correo corresponde a una cuenta, recibirás instrucciones para restablecer tu contraseña.',
    ...(previewUrl ? { previewUrl, localPreview:!env.smtp.host } : {}),
  });
}

async function restablecer(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Faltan datos para restablecer la contraseña.' });

  let payload;
  try {
    payload = verifyResetToken(token);
  } catch {
    return res.status(400).json({ error: 'El enlace de recuperación es inválido o expiró.' });
  }

  const policyError = passwordPolicyError(password);
  if (policyError) return res.status(400).json({ error: policyError });

  await sequelize.transaction(async transaction=>{
    const usuario=await Usuario.findByPk(payload.sub,{transaction,lock:transaction.LOCK.UPDATE});
    if(!usuario||!usuario.estado||usuario.resetTokenHash!==tokenHash(token)||!usuario.resetExpiresAt||usuario.resetExpiresAt<new Date()){
      const err=new Error('El enlace de recuperación es inválido o expiró.');err.status=400;throw err;
    }
    await usuario.update({passwordHash:await hashPassword(password),debeCambiarPassword:false,intentosFallidos:0,bloqueadoHasta:null,resetTokenHash:null,resetExpiresAt:null,sessionVersion:usuario.sessionVersion+1},{transaction});
    await require('../models').Auditoria.create({accionRealizada:'Restablecimiento de contraseña vía enlace',tablaAfectada:'usuario',idUsuario:usuario.idUsuario,ipOrigen:req.ip},{transaction});
  });
  res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
}

async function cambiarPassword(req, res) {
  const { passwordActual, passwordNueva } = req.body;
  if (!passwordActual || !passwordNueva) return res.status(400).json({ error: 'Faltan datos.' });

  const usuario = req.usuario;
  const actualOk = await verifyPassword(passwordActual, usuario.passwordHash);
  if (!actualOk) return res.status(400).json({ error: 'La contraseña actual no es correcta.' });

  const policyError = passwordPolicyError(passwordNueva);
  if (policyError) return res.status(400).json({ error: policyError });
  if (passwordNueva === passwordActual) return res.status(400).json({ error: 'La contraseña nueva debe ser distinta de la actual.' });

  usuario.sessionVersion+=1;
  usuario.resetTokenHash=null;
  usuario.resetExpiresAt=null;
  usuario.passwordHash = await hashPassword(passwordNueva);
  usuario.debeCambiarPassword = false;
  await usuario.save();

  await registrarAuditoria({ accion: 'Cambio de contraseña', tabla: 'usuario', idUsuario: usuario.idUsuario, ip: req.ip });
  res.json({ message: 'Contraseña actualizada.',token:signAccessToken(usuario) });
}

module.exports = { login, logout, me, recuperar, restablecer, cambiarPassword };
