const { verifyAccessToken } = require('../utils/jwt');
const { Usuario, Rol } = require('../models');

// RNF007: RBAC validado en backend, no solo en el frontend.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No se proporcionó un token de sesión.' });

  try {
    const payload = verifyAccessToken(token);
    const usuario = await Usuario.findByPk(payload.sub, { include: { model: Rol, as: 'rol' } });
    if (!usuario || !usuario.estado) {
      return res.status(401).json({ error: 'La sesión ya no es válida.' });
    }
    req.tokenPayload = payload;
    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' });
  }
}

// Permite continuar aunque el usuario todavía deba cambiar la contraseña temporal
// (necesario para /auth/cambiar-password); las demás rutas exigen que ya la haya cambiado.
function requirePasswordAlreadyChanged(req, res, next) {
  if (req.usuario.debeCambiarPassword) {
    return res.status(403).json({ error: 'Debes cambiar tu contraseña temporal antes de continuar.' });
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    const rolActual = req.usuario?.rol?.nombreRol;
    if (!roles.includes(rolActual)) {
      return res.status(403).json({ error: 'Tu rol no tiene permiso para esta acción.' });
    }
    next();
  };
}

module.exports = { requireAuth, requirePasswordAlreadyChanged, requireRole };
