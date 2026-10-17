const {Op}=require('sequelize');
function fail(message,status=400){const error=new Error(message);error.status=status;throw error;}
function text(value,label,max=100){if(typeof value!=='string'||!value.trim()||value.trim().length>max)fail(`${label}: escribe entre 1 y ${max} caracteres.`);return value.trim();}
function number(value,label,min=0,max=360){if(value==null||(typeof value==='string'&&!value.trim())||!['number','string'].includes(typeof value)||!Number.isFinite(Number(value))||Number(value)<min||Number(value)>max)fail(`${label}: valor fuera de rango (${min}–${max}).`);return Number(value);}
function id(value){const n=number(value,'Identificador',1,2147483647);if(!Number.isInteger(n))fail('Identificador inválido.');return n;}
function bool(value){if(typeof value!=='boolean')fail('Estado inválido.');return value;}
// Resolve calendar-day boundaries in Santiago, including DST, independently of server TZ.
function dayStart(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return new Date(value);
 const center=Date.parse(value+'T12:00:00Z');if(!Number.isFinite(center))fail('Fecha inválida.');
 const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'});
 let lo=center-36*3600000,hi=center+36*3600000;
 while(hi-lo>1){const mid=Math.floor((lo+hi)/2);if(fmt.format(new Date(mid))<value)lo=mid;else hi=mid;}
 if(fmt.format(new Date(hi))!==value)fail('Fecha inválida.');return new Date(hi);
}
function dates(query,from='desde',to='hasta'){
 const result={};for(const [key,op] of [[from,Op.gte],[to,Op.lte]]){if(!query[key])continue;let d=dayStart(query[key]);if(key===to&&/^\d{4}-\d{2}-\d{2}$/.test(query[key])){const next=new Date(query[key]+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);d=new Date(+dayStart(next.toISOString().slice(0,10))-1);}if(!Number.isFinite(+d))fail('Fecha inválida.');result[op]=d;}
 if(result[Op.gte]&&result[Op.lte]&&result[Op.gte]>result[Op.lte])fail('La fecha inicial no puede ser posterior a la final.');return Reflect.ownKeys(result).length?result:undefined;
}
function pagination(query){const page=id(query.page??1),pageSize=id(query.pageSize??25);if(pageSize>200)fail('El máximo por página es 200.');return {page,pageSize,limit:pageSize,offset:(page-1)*pageSize};}
module.exports={fail,text,number,id,bool,dates,pagination};
