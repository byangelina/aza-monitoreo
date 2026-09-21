const app = require('./app');
const env = require('./config/env');
const sequelize = require('./config/database');
require('./models'); // registra asociaciones antes de sincronizar

async function main() {
  await sequelize.authenticate();
  // eslint-disable-next-line no-console
  console.log('Conectado a PostgreSQL.');

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API AZA escuchando en http://127.0.0.1:${env.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('No fue posible iniciar el servidor:', err.message);
  process.exit(1);
});
