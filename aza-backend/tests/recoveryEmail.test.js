const test = require('node:test');
const assert = require('node:assert/strict');
const { isRecoveryEmail } = require('../src/utils/recoveryEmail');

test('Recuperación acepta el formato previo de correo y subdominios', () => {
  for (const value of ['persona@demo.example', 'Persona+qa@sub.demo.example', 'área@demo.example']) {
    assert.equal(isRecoveryEmail(value), true, value);
  }
});

test('Recuperación rechaza tipos, separadores y espacios inválidos', () => {
  for (const value of [undefined, null, {}, [], 42, '', '@demo.example', 'persona@@demo.example',
    'persona@demo', 'persona@.example', 'persona@demo.', ' persona@demo.example',
    'persona@demo.example\n', 'per sona@demo.example', 'persona@de\tmo.example']) {
    assert.equal(isRecoveryEmail(value), false);
  }
});

test('Recuperación limita la longitud antes de recorrer entradas adversas', { timeout: 1000 }, () => {
  assert.equal(isRecoveryEmail('a'.repeat(249) + '@b.co'), true);
  assert.equal(isRecoveryEmail('a'.repeat(250) + '@b.co'), false);
  for (const value of ['a@' + '.'.repeat(1000000), 'a'.repeat(1000000), 'a@' + 'a.'.repeat(500000)]) {
    assert.equal(isRecoveryEmail(value), false);
  }
});

test('Recuperación conserva respuesta uniforme para cuenta ausente e inactiva', async (t) => {
  const { Usuario } = require('../src/models');
  const { recuperar } = require('../src/controllers/authController');
  const queries = [];
  const find = t.mock.method(Usuario, 'findOne', async (query) => { queries.push(query); return null; });
  const response = () => ({ code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
  const absent = response();
  await recuperar({ body: { correo: 'Persona@demo.example' } }, absent);
  find.mock.mockImplementation(async () => ({ estado: false }));
  const inactive = response();
  await recuperar({ body: { correo: 'persona@demo.example' } }, inactive);
  assert.equal(absent.code, 200);
  assert.deepEqual(absent.body, inactive.body);
  assert.equal(queries[0].where.correo, 'persona@demo.example');
  const invalid = response();
  await recuperar({ body: { correo: 'a@' + '.'.repeat(100000) } }, invalid);
  assert.equal(invalid.code, 400);
  assert.equal(find.mock.callCount(), 2, 'Una entrada inválida no consulta la base');
});
