const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

// Lista de revocación en memoria para permitir "cerrar sesión" antes de que expire
// el token (RF002 / RNF010). Es una simplificación académica: en una implementación
// multi-instancia esto debería vivir en Redis o una tabla dedicada, no en memoria del proceso.
const revokedTokenIds = new Set();

function signAccessToken(usuario) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    {
      jti,
      version: usuario.sessionVersion,
      sub: usuario.idUsuario,
      correo: usuario.correo,
      rol: usuario.rol?.nombreRol,
      mustChange: usuario.debeCambiarPassword,
    },
    env.auth.jwtSecret,
    { expiresIn: env.auth.jwtExpiresIn }
  );
  return token;
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.auth.jwtSecret);
  if (revokedTokenIds.has(payload.jti)) {
    throw new Error('Token revocado (sesión cerrada).');
  }
  return payload;
}

function revokeToken(payload) {
  if (payload?.jti) revokedTokenIds.add(payload.jti);
}

// Token de restablecimiento de contraseña: firmado aparte, corta duración, sin
// persistir nada en base de datos (evita añadir columnas fuera del diccionario de datos).
function signResetToken(usuario) {
  return jwt.sign({ sub: usuario.idUsuario, purpose: 'password-reset', jti:crypto.randomUUID() }, env.auth.resetSecret, {
    expiresIn: env.auth.resetExpiresIn,
  });
}

function verifyResetToken(token) {
  const payload = jwt.verify(token, env.auth.resetSecret);
  if (payload.purpose !== 'password-reset') throw new Error('Token inválido.');
  return payload;
}

module.exports = { signAccessToken, verifyAccessToken, revokeToken, signResetToken, verifyResetToken };
