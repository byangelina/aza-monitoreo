// Crea las tablas a partir de los modelos Sequelize (9 entidades del diccionario de datos).
// Uso académico: en un proyecto productivo esto se reemplazaría por migraciones versionadas.
const sequelize = require('../config/database');
require('../models');

async function main() {
  await sequelize.authenticate();
  console.log('Conexión a PostgreSQL verificada.');
  await sequelize.sync();
  console.log('Tablas sincronizadas: rol, usuario, receta, lote, batch, inspeccion, alarma, regla_alarma, auditoria.');
  await sequelize.close();
}

main().catch((err) => {
  console.error('Error al sincronizar la base de datos:', err.message);
  process.exit(1);
});
