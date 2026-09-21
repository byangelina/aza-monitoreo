import {test,expect} from '@playwright/test';
async function login(page,role='Operador'){await page.goto('/login');await page.getByRole('button',{name:role,exact:false}).click();await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();}
test('Operador: detalle, observación persistente, menú y acceso restringido',async({page})=>{
  await login(page);await expect(page.getByRole('heading',{name:'Vista general del proceso'})).toBeVisible();
  await page.getByRole('button',{name:'Ver detalle',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Agregar observación').fill('Observación de prueba académica.');await page.getByRole('button',{name:'Guardar observación'}).click();await expect(page.getByText('Observación guardada en la demostración.')).toBeVisible();
  await page.getByRole('button',{name:'Cerrar ventana'}).click();await page.reload();await page.getByRole('button',{name:'Ver detalle',exact:true}).click();await expect(page.getByText('Observación de prueba académica.')).toBeVisible();await page.keyboard.press('Escape');
  await page.goto('/supervisor');await expect(page.getByRole('heading',{name:'Esta vista no corresponde a tu rol'})).toBeVisible();
});
test('Supervisor: filtros, vacío, rango inválido y tendencias',async({page})=>{
  await login(page,'Supervisor');await expect(page.getByRole('heading',{name:'Dashboard de supervisión'})).toBeVisible();await page.getByLabel('Desde',{exact:true}).fill('2026-01-01');await page.getByLabel('Hasta',{exact:true}).fill('2026-01-02');await expect(page.getByText('No hay registros').first()).toBeVisible();
  await page.getByLabel('Desde',{exact:true}).fill('2026-02-01');await expect(page.getByText('La fecha inicial no puede ser posterior a la fecha final.')).toBeVisible();
  await page.getByRole('button',{name:'Limpiar filtros'}).click();await expect(page.getByText('168 inspecciones en el período seleccionado')).toBeVisible();await page.goto('/supervisor/tendencias');await expect(page.getByRole('heading',{name:'Tendencias del proceso'})).toBeVisible();
});
test('Roles pendientes y responsive sin desbordamiento de página',async({page})=>{
  await login(page,'Administrador');await expect(page.getByRole('heading',{name:'Acceso de Administrador'})).toBeVisible();await page.getByLabel('Rol de demostración').selectOption('Área de Calidad');await expect(page.getByRole('heading',{name:'Acceso de Área de Calidad'})).toBeVisible();
  await page.getByLabel('Rol de demostración').selectOption('Supervisor');await expect(page.getByRole('heading',{name:'Dashboard de supervisión'})).toBeVisible();await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('Recuperación y cambio inicial',async({page})=>{
  await page.goto('/recuperar');await page.getByLabel('Correo electrónico').fill('prueba@demo.example');await page.getByRole('button',{name:'Enviar instrucciones'}).click();await expect(page.getByRole('heading',{name:'Solicitud recibida'})).toBeVisible();
  await page.goto('/login');await page.getByLabel('Simular primer acceso').check();await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();await expect(page.getByRole('heading',{name:'Cambia tu contraseña'})).toBeVisible();await page.getByLabel('Nueva contraseña',{exact:true}).fill('Nueva2026A');await page.getByLabel('Confirmar contraseña',{exact:true}).fill('Nueva2026A');await page.getByRole('button',{name:'Guardar y continuar'}).click();await expect(page.getByText('Contraseña de demostración actualizada.')).toBeVisible();
});
