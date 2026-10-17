const fs = require('node:fs');
const { X509Certificate } = require('node:crypto');

function databaseTls({ ssl, sslCa, sslCaFile }) {
  if (!ssl) return {};
  const options = { require: true, rejectUnauthorized: true };
  if (sslCa && sslCaFile) throw new Error('Configura solo DB_SSL_CA o DB_SSL_CA_FILE.');
  const ca = sslCa ? sslCa.replace(/\\n/g, '\n') : sslCaFile ? fs.readFileSync(sslCaFile, 'utf8') : '';
  if (ca) {
    const certificates = ca.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g);
    if (!certificates) throw new Error('DB_SSL_CA debe contener un certificado PEM de confianza.');
    try { certificates.forEach(pem => new X509Certificate(pem)); }
    catch { throw new Error('El certificado configurado en DB_SSL_CA no es válido.'); }
    options.ca = ca;
  }
  return { ssl: options };
}
module.exports = { databaseTls };
