const env = require('../config/env');

// RNF004: toda solicitud de escritura desde el sistema de captura/simulador debe
// autenticarse mediante token o API Key protegida (distinta de la sesión humana JWT).
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!env.ingesta.apiKey || key !== env.ingesta.apiKey) {
    return res.status(401).json({ error: 'API Key inválida o no proporcionada.' });
  }
  next();
}

module.exports = { requireApiKey };
