const {Op}=require('sequelize');
const {sequelize,Inspeccion,Receta,Lote,Batch,Alarma,ReglaAlarma}=require('../models');
const {serializar,INCLUDE_CONTEXTO}=require('./inspeccionController');
const {inspectionInput}=require('../utils/inspectionInput');const v=require('../utils/validation');
const ESTADOS={APROBADO:'Aprobado',RECHAZADO:'Rechazado','SIN RECETA':'Sin receta'};
async function registrarInspeccion(req,res){
 let input;try{input=inspectionInput(req.body);}catch(e){v.fail(e.message);}
 const status=ESTADOS[String(req.body.estado||'').trim().toUpperCase()];if(!status)v.fail('Estado no reconocido.');
 const ref=req.headers['x-idempotency-key']||req.body.referencia;const reference=ref?v.text(ref,'Referencia externa',128):null;
 const result=await sequelize.transaction(async transaction=>{
  // Serialize ingestion to make retries and consecutive-event rules deterministic.
  await sequelize.query('SELECT pg_advisory_xact_lock(8123002)',{transaction});
  if(reference){const old=await Inspeccion.findOne({where:{referenciaExterna:reference},transaction});if(old)return {id:old.idInspeccion,replayed:true};}
  const recipeName=req.body.receta? v.text(req.body.receta,'Receta'):null;
  let recipe=recipeName?await Receta.findOne({where:sequelize.where(sequelize.fn('lower',sequelize.col('nombre_receta')),recipeName.toLowerCase()),transaction,lock:transaction.LOCK.UPDATE}):null;
  if(recipe&&!recipe.estado)v.fail('La receta está desactivada y no admite nuevas inspecciones.',409);
  const code=v.text(req.body.lote||'SIN-LOTE-APP-AZA','Lote',50);
  let lot=await Lote.findOne({where:{codigoLote:code},transaction,lock:transaction.LOCK.UPDATE});
  if(!lot){if(!recipe)v.fail('Para crear el lote se necesita una receta activa reconocida.',422);lot=await Lote.create({codigoLote:code,idReceta:recipe.idReceta,fechaInicio:new Date(),estado:'Abierto'},{transaction});}
  if(lot.estado!=='Abierto')v.fail('El lote está cerrado. Reábrelo para registrar nuevas inspecciones.',409);
  if(recipe&&lot.idReceta!==recipe.idReceta)v.fail('La receta enviada no corresponde al lote.',409);
  const batchName=v.text(req.body.carpeta||`AUTO-${Date.now()}`,'Batch',50);
  const [batch]=await Batch.findOrCreate({where:{idLote:lot.idLote,numeroBatch:batchName},defaults:{idLote:lot.idLote,numeroBatch:batchName},transaction});
  const finalStatus=recipe?status:'Sin receta';if(finalStatus==='Sin receta')recipe=null;
  const item=await Inspeccion.create({fechaHora:input.fecha,anguloMedido:input.angulo,estadoResultado:finalStatus,limiteMinSnapshot:recipe?.anguloMin??null,limiteMaxSnapshot:recipe?.anguloMax??null,imagenAnalisisUrl:input.imagenAnalisisUrl,imagenCapturaUrl:input.imagenCapturaUrl,referenciaExterna:reference,idBatch:batch.idBatch,idReceta:recipe?.idReceta??null,idUsuario:null,observacion:req.body.operador?`Origen: ${v.text(req.body.operador,'Operador/origen',150)}`:null},{transaction});
  const rules=await ReglaAlarma.findAll({where:{activo:true},transaction});
  for(const rule of rules){
   let match=rule.tipoRegla==='Resultado rechazado'&&finalStatus==='Rechazado'||rule.tipoRegla==='Sin receta'&&finalStatus==='Sin receta'||rule.tipoRegla==='Ángulo superior'&&input.angulo>Number(rule.valorUmbral)||rule.tipoRegla==='Ángulo inferior'&&input.angulo<Number(rule.valorUmbral);
   if(rule.tipoRegla==='Rechazos consecutivos'&&finalStatus==='Rechazado'){
    const n=rule.cantidadEventos||1;const recent=await Inspeccion.findAll({where:{fechaHora:{[Op.lte]:input.fecha}},include:[{model:Batch,as:'batch',where:{idLote:lot.idLote},required:true}],order:[['fechaHora','DESC'],['idInspeccion','DESC']],limit:n,transaction});match=recent.length===n&&recent.every(i=>i.estadoResultado==='Rechazado');
   }
   if(match)await Alarma.create({tipoEvento:rule.tipoRegla,descripcion:`${rule.nombreRegla}: lote ${lot.codigoLote}, batch ${batch.numeroBatch}. Regla de configuración académica.`,estadoAlarma:'Activa',idInspeccion:item.idInspeccion,idRegla:rule.idRegla},{transaction});
  }
  return {id:item.idInspeccion,replayed:false};
 });
 const item=await Inspeccion.findByPk(result.id,{include:INCLUDE_CONTEXTO});res.status(result.replayed?200:201).json({item:serializar(item),replayed:result.replayed});
}
module.exports={registrarInspeccion};
