const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

// RNF013: cabeceras de seguridad (clickjacking, MIME sniffing, etc.).
app.use(helmet());

// Solo el frontend configurado puede llamar a la API con credenciales.
app.use(cors({ origin: env.frontendUrl, credentials: true }));

app.use(express.json({ limit: '100kb' }));
if (env.nodeEnv !== 'test') app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
