import {test,expect} from '@playwright/test';
async function fixture(page,role='Operador',count=1){
  const user={id:1,nombre:'Operador QA',correo:'qa@example.com',rol:role,debeCambiarPassword:false};
  const items=Array.from({length:count},(_,i)=>({id:count-i,fechaHora:new Date(Date.now()-i*1000).toISOString(),angulo:276.54,estado:'Rechazado',limiteMin:270,limiteMax:280,receta:{id:1,nombre:'Alambrón 6 mm'},lote:{codigo:'L-001'},batch:{numero:'B-001'},observacion:null}));
  const state={offline:false,items,alarms:[{id:1,inspeccionId:count,tipoEvento:'Resultado rechazado',descripcion:'Revisar inspección',estado:'Activa',fechaGeneracion:new Date().toISOString()}]};
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;let body={};
    if(state.offline&&!path.includes('/auth/'))return route.fulfill({status:503,json:{error:'API no disponible'}});
    if(path.endsWith('/auth/me'))body={user};
    else if(path.endsWith('/auth/login'))body={user,token:'qa-only'};
    else if(path.endsWith('/catalogo/recetas'))body={items:[{id:1,nombre:'Alambrón 6 mm',anguloMin:270,anguloMax:280,activa:true}]};
    else if(path.endsWith('/catalogo/lotes'))body={items:[{id:1,codigo:'L-001',recetaId:1}]};
    else if(path.endsWith('/catalogo/batches'))body={items:[{numero:'B-001',loteId:1}]};
    else if(path.endsWith('/observaciones')){items[0].observacion=`[Operador QA · ${new Date().toISOString()}] ${route.request().postDataJSON().texto}`;body={item:items[0]};}
    else if(path.endsWith('/reconocer')){state.alarms[0].estado='Reconocida';body={};}
    else if(path.endsWith('/alarmas'))body={items:state.alarms};
    else if(path.endsWith('/inspecciones/recientes'))body={items};
    else if(path.endsWith('/inspecciones')){const pageNumber=Number(new URL(route.request().url()).searchParams.get('page')||1);body={items:items.slice((pageNumber-1)*200,pageNumber*200),total:items.length};}
    else if(/inspecciones\/\d+$/.test(path))body={item:items[0]};
    return route.fulfill({json:body});
  });
  await page.goto('/login');await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();
  return state;
}
test('Operador: sala, imágenes ausentes, preferencia, detalle y observaciones',async({page})=>{
 await fixture(page);await expect(page.getByRole('heading',{name:'Control de trefilado'})).toBeVisible();
 await expect(page.getByText('Esperando imagen')).toHaveCount(2);
 await page.getByRole('link',{name:'Modo sala'}).click();await expect(page.getByRole('heading',{name:'Monitor de sala'})).toBeVisible();
 await expect(page.locator('.sidebar')).toHaveCount(0);await expect(page.locator('.op-angle strong')).toHaveText('276.54°');
 await page.getByLabel('Mostrar captura real').uncheck();await page.reload();await expect(page.getByLabel('Mostrar captura real')).not.toBeChecked();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.getByRole('button',{name:'Detalle y observaciones'}).click();await page.getByLabel('Agregar observación').fill('Revisión QA');await page.getByRole('button',{name:'Guardar observación'}).click();await expect(page.getByText('Observación guardada.',{exact:true})).toBeVisible();await page.keyboard.press('Escape');
 await page.goto('/supervisor');await expect(page.getByRole('heading',{name:'Esta vista no corresponde a tu rol'})).toBeVisible();
});
test('La pérdida de conexión conserva el resultado y avisa; luego se recupera',async({page})=>{
 const state=await fixture(page);await expect(page.getByText('API conectada',{exact:true})).toBeVisible();state.offline=true;await expect(page.getByText('SIN ACTUALIZACIÓN CONFIRMADA')).toBeVisible({timeout:12000});await expect(page.locator('.op-angle strong')).toHaveText('276.54°');state.offline=false;await page.getByRole('button',{name:'Reintentar'}).click();await expect(page.getByText('API conectada',{exact:true})).toBeVisible();
});
test('Supervisor carga más de 200 registros y valida filtros',async({page})=>{
 await fixture(page,'Supervisor',205);await expect(page.getByText('205 inspecciones en el período seleccionado')).toBeVisible();
 await page.getByLabel('Desde',{exact:true}).fill('2026-12-01');await page.getByLabel('Hasta',{exact:true}).fill('2026-01-01');await expect(page.getByText('La fecha inicial no puede ser posterior a la fecha final.')).toBeVisible();await page.getByRole('button',{name:'Limpiar filtros'}).click();await expect(page.getByText('205 inspecciones en el período seleccionado')).toBeVisible();
});
test('TV 1080p: jerarquía, dos imágenes y resultado sin recalcular',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await fixture(page);await page.getByRole('link',{name:'Modo sala'}).click();await expect(page.locator('.op-verdict>strong')).toHaveText('Rechazado');
 await expect.poll(()=>page.locator('.op-angle>strong').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(200);
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight)).toBeTruthy();
 await page.screenshot({path:'test-results/operator-tv.png',fullPage:true});
});

test('Imágenes recibidas, ampliación y reconocimiento de alarma',async({page})=>{
 const state=await fixture(page);await expect(page.locator('.op-angle strong')).toBeVisible();
 await page.route('https://qa.example.com/*.svg',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#203750"/><path d="M100 300 L400 100 L700 300" fill="none" stroke="#5df0b3" stroke-width="14"/><text x="20" y="45" fill="white" font-size="28">IMAGEN DE PRUEBA QA</text></svg>'}));
 state.items[0].imagenAnalisisUrl='https://qa.example.com/analysis.svg';state.items[0].imagenCapturaUrl='https://qa.example.com/capture.svg';
 await expect(page.getByRole('img',{name:'Imagen analizada',exact:true})).toBeVisible({timeout:12000});await expect(page.getByRole('img',{name:'Captura real',exact:true})).toBeVisible();await page.getByRole('button',{name:'Ampliar Imagen analizada'}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
 await page.goto('/operador/alarmas');await page.getByRole('button',{name:'Reconocer',exact:true}).click();await page.getByRole('button',{name:'Confirmar reconocimiento'}).click();await expect(page.getByText('Sin alarmas en esta vista')).toBeVisible();await page.getByLabel('Estado de alarma').selectOption('Reconocida');await expect(page.getByText('Reconocimiento registrado')).toBeVisible();
});
