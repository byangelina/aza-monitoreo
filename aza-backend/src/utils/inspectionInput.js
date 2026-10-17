function imageUrl(value) {
  if(value == null || value === '')return null;
  if(typeof value !== 'string' || value.length>2048)throw new Error('URL de imagen inválida.');
  let url;try{url=new URL(value);}catch{throw new Error('La imagen debe usar una URL HTTP o HTTPS absoluta.');}
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('La imagen debe usar HTTP o HTTPS sin credenciales.');
  return url.href;
}
function inspectionInput(body) {
  if(!['number','string'].includes(typeof body.angulo)||String(body.angulo).trim()===''||!Number.isFinite(Number(body.angulo))||Number(body.angulo)<0||Number(body.angulo)>360)throw new Error('El ángulo debe ser un número entre 0 y 360 grados.');
  const date=body.fecha==null?new Date():new Date(body.fecha);
  if(!Number.isFinite(date.getTime()))throw new Error('La fecha de inspección no es válida.');
  return {angulo:Number(body.angulo),fecha:date,imagenAnalisisUrl:imageUrl(body.imagenAnalisisUrl),imagenCapturaUrl:imageUrl(body.imagenCapturaUrl)};
}
module.exports={imageUrl,inspectionInput};
