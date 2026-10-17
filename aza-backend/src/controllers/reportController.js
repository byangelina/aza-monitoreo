const PDFDocument=require('pdfkit');const {Inspeccion}=require('../models');const {historyQuery}=require('../utils/historyQuery');const {serializar}=require('./inspeccionController');const v=require('../utils/validation');
const MAX=10000;
function csvCell(value){let s=String(value??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
async function report(req,res){
 const snapshotMaxId=req.query.maxId!==undefined? v.number(req.query.maxId,'Corte de reporte',0,2147483647):await Inspeccion.max('idInspeccion')||0;
 const query=historyQuery({...req.query,maxId:snapshotMaxId});const total=await Inspeccion.count({where:query.where,include:query.include,distinct:true});
 if(total>MAX)v.fail(`La exportación admite ${MAX} filas. Reduce el período o aplica más filtros.`,422);
 const items=(await Inspeccion.findAll(query)).map(serializar);const summary={total:items.length,aprobadas:items.filter(i=>i.estado==='Aprobado').length,rechazadas:items.filter(i=>i.estado==='Rechazado').length,sinReceta:items.filter(i=>i.estado==='Sin receta').length};summary.tasa=summary.total?summary.aprobadas/summary.total*100:null;
 const format=req.query.formato||'json';if(format==='json')return res.json({summary,snapshotMaxId,generatedAt:new Date(),filters:req.query,items});
 const headers=['ID','Fecha UTC','Ángulo','Estado','Receta','Lote','Batch','Mínimo aplicado','Máximo aplicado'];
 const rows=items.map(i=>[i.id,new Date(i.fechaHora).toISOString(),i.angulo,i.estado,i.receta?.nombre||'Sin receta',i.lote?.codigo,i.batch?.numero,i.limiteMin,i.limiteMax]);
 if(format==='csv'){res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="aza-inspecciones.csv"');return res.send('\uFEFF'+[headers,...rows].map(r=>r.map(csvCell).join(';')).join('\r\n'));}
 if(format!=='pdf')v.fail('Formato no admitido.');
 const doc=new PDFDocument({size:'A4',layout:'landscape',margin:36,info:{Title:'AZA - Reporte de inspecciones'}});res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition','attachment; filename="aza-reporte.pdf"');doc.pipe(res);
 doc.fontSize(20).fillColor('#142b44').text('AZA | Reporte de inspecciones');doc.fontSize(9).fillColor('#333').text(`Generado: ${new Date().toISOString()} | ${req.usuario.nombreCompleto} | Fechas de filas en UTC`);
 doc.moveDown().text(`Total: ${summary.total}   Aprobadas: ${summary.aprobadas}   Rechazadas: ${summary.rechazadas}   Sin receta: ${summary.sinReceta}   Aprobación: ${summary.tasa===null?'Sin datos':summary.tasa.toFixed(1)+'%'}`);
 doc.text('Tasa = aprobadas / total (incluye Sin receta). Estados recibidos; no recalculados.');
 doc.text(`Filtros: ${Object.entries(req.query).filter(([k])=>k!=='formato').map(([k,value])=>k+'='+value).join(' | ')||'Todos los registros'}`);doc.moveDown();
 const widths=[34,115,49,73,111,84,99,58,58];let y=doc.y;
 function row(values,heading=false){const height=Math.max(24,...values.map((value,i)=>doc.fontSize(8).heightOfString(String(value??'—'),{width:widths[i]-8})+12));if(y+height>550){doc.addPage();y=36;row(headers,true);}let x=36;if(heading){doc.rect(36,y,781,height).fill('#e5edf5');}values.forEach((value,i)=>{doc.fillColor('#172c43').fontSize(8).text(String(value??'—'),x+4,y+6,{width:widths[i]-8,height:height-8});x+=widths[i];});y+=height;}
 row(headers,true);for(const values of rows)row(values);if(!rows.length)doc.text('Sin registros para los filtros seleccionados.',36,y+12);doc.end();
}
module.exports={report,csvCell};
