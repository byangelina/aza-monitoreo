const v=require('./validation');const {Batch,Lote,Receta,Usuario}=require('../models');
function historyQuery(query){const where={};if(query.maxId!==undefined&&query.maxId!=='')where.idInspeccion={[require('sequelize').Op.lte]:v.number(query.maxId,'Corte de reporte',0,2147483647)};const range=v.dates(query);if(range)where.fechaHora=range;
 if(query.idReceta)where.idReceta=v.id(query.idReceta);if(query.idBatch)where.idBatch=v.id(query.idBatch);
 if(query.estado){if(!['Aprobado','Rechazado','Sin receta'].includes(query.estado))v.fail('Estado inválido.');where.estadoResultado=query.estado;}
 const include=[{model:Batch,as:'batch',include:[{model:Lote,as:'lote'}],...(query.idLote?{where:{idLote:v.id(query.idLote)},required:true}:{})},{model:Receta,as:'receta'},{model:Usuario,as:'operador',attributes:['idUsuario','nombreCompleto']}];
 return {where,include,order:[['fechaHora',query.orden==='asc'?'ASC':'DESC'],['idInspeccion',query.orden==='asc'?'ASC':'DESC']]};}
module.exports={historyQuery};
