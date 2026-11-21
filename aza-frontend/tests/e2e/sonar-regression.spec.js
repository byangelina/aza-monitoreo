import { test, expect } from './coverage-fixture.js';

async function prepare(page, { expired = false, saveFails = false } = {}) {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.addInitScript(() => localStorage.setItem('aza-token', 'local-qa-session'));
  const user = { id: 1, nombre: 'Administración QA', correo: 'qa@demo.example', rol: 'Administrador', debeCambiarPassword: false };
  const state = { saveFails, saved: false, logoutCalls: 0 };
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me')) return route.fulfill({ status: expired ? 401 : 200, json: expired ? { error: 'Sesión expirada' } : { user } });
    if (path.endsWith('/auth/logout')) { state.logoutCalls++; return route.fulfill({ status: 503, json: { error: 'Sin conexión' } }); }
    if (path.endsWith('/gestion/recetas') && route.request().method() === 'POST') {
      if (state.saveFails) return route.fulfill({ status: 503, json: { error: 'No se pudo guardar la receta de QA' } });
      state.saved = true;
      return route.fulfill({ status: 201, json: { id: 1 } });
    }
    return route.fulfill({ json: { items: [], total: 0 } });
  });
  return { state, failures };
}

test('Inicialización restaura una sesión válida sin rechazos de promesas', async ({ page }) => {
  const { failures } = await prepare(page);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Administración del sistema' })).toBeVisible();
  expect(failures).toEqual([]);
});

test('Inicialización fallida elimina el token y permite volver al login', async ({ page }) => {
  const { failures } = await prepare(page, { expired: true });
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('aza-token'))).toBeNull();
  await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeEnabled();
  expect(failures).toEqual([]);
});

test('Inactividad limpia la sesión incluso si falla el logout del servidor', async ({ page }) => {
  await page.clock.install();
  const { state, failures } = await prepare(page);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Administración del sistema' })).toBeVisible();
  await page.clock.fastForward(31 * 60 * 1000);
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('aza-token'))).toBeNull();
  expect(state.logoutCalls).toBeGreaterThan(0);
  expect(failures).toEqual([]);
});

test('Guardar informa el error, recupera el botón y permite reintentar', async ({ page }) => {
  const { state, failures } = await prepare(page, { saveFails: true });
  await page.goto('/admin/recetas');
  await page.getByRole('button', { name: 'Crear receta' }).click();
  await page.getByLabel('Nombre', { exact: true }).fill('Receta QA Sonar');
  await page.getByLabel('Material', { exact: true }).fill('Acero QA');
  await page.getByLabel('Espesor objetivo (mm)').fill('6');
  await page.getByLabel('Ángulo mínimo (°)').fill('270');
  await page.getByLabel('Ángulo máximo (°)').fill('280');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('dialog')).toContainText('No se pudo guardar la receta de QA');
  await expect(page.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
  state.saveFails = false;
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('Cambios guardados correctamente.')).toBeVisible();
  expect(state.saved).toBe(true);
  expect(failures).toEqual([]);
});

test('El fondo del menú móvil es un botón que responde a Enter y Espacio', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { failures } = await prepare(page);
  await page.goto('/admin');
  const backdrop = page.getByRole('button', { name: 'Cerrar menú lateral', exact: true });
  await expect(backdrop).toBeHidden();
  for (const key of ['Enter', 'Space']) {
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await expect(backdrop).toBeVisible();
    await backdrop.focus();
    await expect(backdrop).toBeFocused();
    await page.keyboard.press(key);
    await expect(backdrop).toBeHidden();
  }
  expect(failures).toEqual([]);
});

test('Perfil permite cambiar contraseña y vuelve al espacio del usuario', async ({ page }) => {
  const { failures } = await prepare(page);
  await page.route('**/api/auth/cambiar-password', route => route.fulfill({ json: { token: 'renewed-local-qa-session' } }));
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Ver perfil' }).click();
  await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
  await expect(page).toHaveURL(/\/cambiar-contrasena$/);
  await page.getByLabel('Contraseña actual', { exact: true }).fill('PreviousQa123');
  await page.getByLabel('Nueva contraseña', { exact: true }).fill('UpdatedQa456');
  await page.getByLabel('Confirmar contraseña', { exact: true }).fill('UpdatedQa456');
  await page.getByRole('button', { name: 'Guardar y continuar' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  expect(await page.evaluate(() => localStorage.getItem('aza-token'))).toBe('renewed-local-qa-session');
  expect(failures).toEqual([]);
});

test('Login navega al espacio autorizado después de autenticar', async ({ page }) => {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  const user = { id: 1, nombre: 'Administración QA', correo: 'qa@demo.example', rol: 'Administrador', debeCambiarPassword: false };
  await page.route('**/api/**', route => route.fulfill({ json: route.request().url().endsWith('/auth/login') ? { token: 'local-qa-login', user } : { items: [], total: 0 } }));
  await page.goto('/login');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Administración del sistema' })).toBeVisible();
  expect(failures).toEqual([]);
});
