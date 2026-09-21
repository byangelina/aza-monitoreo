const test = require('node:test');
const assert = require('node:assert/strict');
const { passwordPolicyError, hashPassword, verifyPassword } = require('../src/utils/password');

test('RNF002: exige 8+ caracteres, una mayúscula y un número', () => {
  assert.ok(passwordPolicyError('corta1A'));
  assert.ok(passwordPolicyError('sinmayuscula1'));
  assert.ok(passwordPolicyError('SinNumero'));
  assert.equal(passwordPolicyError('Valida2026'), null);
});

test('RNF001: la contraseña se hashea y nunca se compara en texto plano', async () => {
  const hash = await hashPassword('Valida2026');
  assert.notEqual(hash, 'Valida2026');
  assert.ok(await verifyPassword('Valida2026', hash));
  assert.equal(await verifyPassword('Incorrecta1', hash), false);
});
