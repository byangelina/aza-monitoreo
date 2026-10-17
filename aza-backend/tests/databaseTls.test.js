const test = require('node:test');
const assert = require('node:assert/strict');
const { rootCertificates } = require('node:tls');
const { databaseTls } = require('../src/config/databaseTls');
test('TLS verifica certificados por defecto y permite PostgreSQL local sin TLS', () => {
  assert.deepEqual(databaseTls({ssl:false}), {});
  assert.equal(databaseTls({ssl:true}).ssl.rejectUnauthorized, true);
});
test('Acepta CA PEM con saltos reales o escapados sin desactivar verificación', () => {
  const pem = rootCertificates[0];
  for (const ca of [pem, pem.replace(/\n/g, '\\n')]) {
    const result = databaseTls({ssl:true,sslCa:ca});
    assert.equal(result.ssl.ca, pem);
    assert.equal(result.ssl.rejectUnauthorized, true);
  }
});
test('Rechaza certificados malformados y configuración ambigua', () => {
  assert.throws(() => databaseTls({ssl:true,sslCa:'incorrecto'}), /PEM/);
  assert.throws(() => databaseTls({ssl:true,sslCa:'x',sslCaFile:'x'}), /solo/);
});
