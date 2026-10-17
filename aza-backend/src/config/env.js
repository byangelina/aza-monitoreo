require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? (process.env.NODE_ENV==='production'?undefined:fallback);
  if (value === undefined) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || 'http://127.0.0.1:5173',

  db: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || 'aza',
    user: process.env.DB_USER || 'aza_app',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    sslCa: process.env.DB_SSL_CA || '',
    sslCaFile: process.env.DB_SSL_CA_FILE || '',
  },

  auth: {
    jwtSecret: required('JWT_SECRET', 'dev-only-insecure-secret-change-me'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30m',
    resetSecret: required('RESET_TOKEN_SECRET', 'dev-only-insecure-reset-secret-change-me'),
    resetExpiresIn: process.env.RESET_TOKEN_EXPIRES_IN || '10m',
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
    lockAttempts: Number(process.env.ACCOUNT_LOCK_ATTEMPTS || 5),
    lockMinutes: Number(process.env.ACCOUNT_LOCK_MINUTES || 15),
  },

  // RF047/INT15: autenticación técnica del sistema de captura/simulador (APP-AZA u otro).
  ingesta: {
    apiKey: process.env.INGESTA_API_KEY || '',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'AZA Monitoreo <no-responder@aza.demo>',
  },
};
