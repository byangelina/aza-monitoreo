const fs=require('fs'),path=require('path'),{spawn,spawnSync}=require('child_process');
const root=__dirname,logs=path.join(root,'.local');fs.mkdirSync(logs,{recursive:true});
const pgData='C:/Users/Angur/Documents/Codex/2026-09-13/so/work/aza-pgdata';
const pgCtl='C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe';
const env=require('./aza-backend/node_modules/dotenv').parse(fs.readFileSync(path.join(root,'aza-backend/.env')));
if(env.DATABASE_URL||env.DB_HOST!=='127.0.0.1'||env.DB_NAME!=='aza_pruebas')throw new Error('La configuración no corresponde a la base local aza_pruebas.');
if(spawnSync(pgCtl,['-D',pgData,'status'],{windowsHide:true,stdio:'ignore'}).status!==0){
 const result=spawnSync(pgCtl,['-D',pgData,'-l',path.join(logs,'postgres.log'),'-o','-h 127.0.0.1 -p 55432','-w','start'],{windowsHide:true,stdio:'inherit'});if(result.status!==0)process.exit(1);
}
async function running(url){try{return (await fetch(url,{signal:AbortSignal.timeout(1500)})).ok;}catch{return false;}}
function launch(folder,args,name){const out=fs.openSync(path.join(logs,name+'.log'),'a');const child=spawn(process.execPath,args,{cwd:path.join(root,folder),detached:true,windowsHide:true,stdio:['ignore',out,out]});child.unref();fs.closeSync(out);}
(async()=>{
 if(!await running('http://127.0.0.1:4000/api/health'))launch('aza-backend',['src/server.js'],'api');
 if(!await running('http://127.0.0.1:5173'))launch('aza-frontend',['node_modules/vite/bin/vite.js','--configLoader','native','--host','127.0.0.1','--port','5173','--strictPort'],'frontend');
 console.log('AZA local: http://127.0.0.1:5173 — espera unos segundos si acaba de iniciar.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
