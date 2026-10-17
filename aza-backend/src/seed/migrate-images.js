// Additive and repeatable: preserves inspections and existing data.
const db=require('../config/database');
async function migrate(){try{await db.authenticate();await db.transaction(async transaction=>{
  await db.query('ALTER TABLE inspeccion ADD COLUMN IF NOT EXISTS imagen_analisis_url TEXT, ADD COLUMN IF NOT EXISTS imagen_captura_url TEXT',{transaction});
});console.log('Columnas de imágenes disponibles.');}finally{await db.close();}}
migrate().catch(e=>{console.error('Migración no aplicada:',e.message);process.exitCode=1;});
