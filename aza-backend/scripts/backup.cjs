const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const env=require('../src/config/env');
const directory=path.resolve(__dirname,'../../.local/backups');fs.mkdirSync(directory,{recursive:true});
const file=path.join(directory,`aza-${new Date().toISOString().replace(/[:.]/g,'-')}.dump`);
const bin=process.env.PG_DUMP_PATH||(process.platform==='win32'?'C:/Program Files/PostgreSQL/18/bin/pg_dump.exe':'pg_dump');
let connection=env.db;
if(env.db.url){const url=new URL(env.db.url);connection={host:url.hostname,port:url.port||5432,user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),name:url.pathname.slice(1)};}
const result=spawnSync(bin,['-h',connection.host,'-p',String(connection.port),'-U',connection.user,'-d',connection.name,'-Fc','-f',file],{env:{...process.env,PGPASSWORD:connection.password,PGSSLMODE:env.db.ssl?'verify-full':'disable'},windowsHide:true,encoding:'utf8'});
if(result.status!==0){console.error('No se pudo crear el respaldo. Revisa pg_dump y la conexión.');process.exit(1);}
console.log('Respaldo creado:',file);
