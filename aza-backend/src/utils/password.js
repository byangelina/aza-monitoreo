const bcrypt = require('bcryptjs');
const env = require('../config/env');

// RNF001: hash adaptativo robusto (bcrypt). Nunca se almacena ni se compara texto plano.
async function hashPassword(plain) {
  return bcrypt.hash(plain, env.auth.bcryptSaltRounds);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// RNF002: política mínima de contraseñas (8+ caracteres, 1 mayúscula, 1 número).
function passwordPolicyError(value) {
  if (typeof value !== 'string' || value.length < 8 || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.';
  }
  if(Buffer.byteLength(value,'utf8')>72)return 'La contraseña no puede superar 72 bytes UTF-8.';
  return null;
}

module.exports = { hashPassword, verifyPassword, passwordPolicyError };
