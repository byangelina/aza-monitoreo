const db=require('../config/database');
(async()=>{await db.transaction(async transaction=>{
 await db.query('ALTER TABLE usuario ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS reset_token_hash VARCHAR(64), ADD COLUMN IF NOT EXISTS reset_expires_at TIMESTAMPTZ',{transaction});
 await db.query('ALTER TABLE inspeccion ADD COLUMN IF NOT EXISTS referencia_externa VARCHAR(128)',{transaction});
 await db.query('CREATE UNIQUE INDEX IF NOT EXISTS inspeccion_referencia_externa_unique ON inspeccion(referencia_externa)',{transaction});
});console.log('Migración de seguridad aplicada.');})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>db.close());
