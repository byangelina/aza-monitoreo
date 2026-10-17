const assert=require('node:assert/strict');
const env=require('../src/config/env');
const db=require('../src/config/database');
const {Inspeccion,Alarma}=require('../src/models');
if(env.db.url||env.db.host!=='127.0.0.1'||env.db.name!=='aza_pruebas')throw new Error('Solo se permite ejecutar esta prueba en aza_pruebas local.');
const base='http://127.0.0.1:'+env.port+'/api';
async function request(path,{token,body,key,method='GET',status=200}={}){
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(key?{'x-api-key':key}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const text=await response.text();const data=text?JSON.parse(text):{};assert.equal(response.status,status,`${method} ${path}: ${data.error||''}`);return data;
}
(async()=>{
 const operator=await request('/auth/login',{method:'POST',body:{correo:'operador@demo.example',password:'Demo2026!'}});
 const supervisor=await request('/auth/login',{method:'POST',body:{correo:'supervisor@demo.example',password:'Demo2026!'}});
 assert.equal((await request('/auth/me',{token:operator.token})).user.rol,'Operador');
 await request('/inspecciones',{token:operator.token,status:403});
 const recipes=(await request('/catalogo/recetas',{token:operator.token})).items;
 const lots=(await request('/catalogo/lotes',{token:operator.token})).items;
 const marker='QA-LOCAL-'+Date.now();
 const {item}=await request('/ingesta/inspecciones',{method:'POST',key:env.ingesta.apiKey,status:201,body:{angulo:276.54,estado:'RECHAZADO',receta:recipes[0].nombre,lote:lots[0].codigo,carpeta:marker,operador:'SIMULACIÓN LOCAL QA'}});
 assert.equal(item.estado,'Rechazado');assert.equal(item.angulo,276.54);
 await request(`/inspecciones/${item.id}/observaciones`,{method:'POST',token:operator.token,body:{texto:'Verificación de persistencia local '+marker}});
 const detail=(await request(`/inspecciones/${item.id}`,{token:operator.token})).item;
 assert.ok(detail.observacion.includes(marker));
 const saved=await Inspeccion.findByPk(item.id);assert.ok(saved.observacion.includes(marker));
 const alarm=(await request('/alarmas',{token:operator.token})).items.find(a=>a.inspeccionId===item.id);assert.ok(alarm,'Alarma creada por rechazo');
 await request(`/alarmas/${alarm.id}/reconocer`,{method:'POST',token:operator.token});
 const persisted=await Alarma.findByPk(alarm.id);assert.equal(persisted.estadoAlarma,'Reconocida');
 const history=await request('/inspecciones?pageSize=200',{token:supervisor.token});assert.ok(history.items.some(i=>i.id===item.id));
 await request('/auth/logout',{method:'POST',token:operator.token,status:204});await request('/auth/me',{token:operator.token,status:401});
 console.log(JSON.stringify({result:'OK',database:'aza_pruebas',inspectionId:item.id,checks:['login','rol y sesión','rechazo de acceso histórico a operador','ingesta','observación persistida en PostgreSQL','alarma generada y reconocida en PostgreSQL','histórico supervisor','logout y revocación']}));
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>db.close());
