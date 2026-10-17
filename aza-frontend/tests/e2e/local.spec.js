import {test,expect} from '@playwright/test';
test('Integración local real: login, sala, observación persistente y alarmas',async({page})=>{
 test.skip(process.env.AZA_LOCAL_INTEGRATION!=='1','Requiere instancia aza_pruebas y API local.');
 const note='Prueba de interfaz con PostgreSQL '+Date.now();
 await page.goto('/login');await page.getByRole('button',{name:'Operador',exact:false}).click();await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Control de trefilado'})).toBeVisible();
 await page.getByRole('link',{name:'Modo sala'}).click();await expect(page.getByText('API conectada',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Detalle y observaciones'}).click();await page.getByLabel('Agregar observación').fill(note);await page.getByRole('button',{name:'Guardar observación'}).click();await expect(page.getByText('Observación guardada.',{exact:true})).toBeVisible();
 await page.keyboard.press('Escape');await page.reload();await page.getByRole('button',{name:'Detalle y observaciones'}).click();await expect(page.getByText(note,{exact:true})).toBeVisible();await page.keyboard.press('Escape');
 await page.goto('/operador/alarmas');await page.getByLabel('Estado de alarma').selectOption('Reconocida');await expect(page.getByText('Reconocimiento registrado').first()).toBeVisible();
 await page.setViewportSize({width:1920,height:1080});await page.goto('/operador/sala');await expect(page.locator('.op-angle strong')).toBeVisible();await page.screenshot({path:'test-results/operator-postgresql-local.png',fullPage:true});
});
