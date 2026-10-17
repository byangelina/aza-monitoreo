// RNF040: códigos HTTP apropiados y respuestas de error estructuradas, sin stack traces al cliente.
function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Recurso no encontrado.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if(err.name==='SequelizeUniqueConstraintError')return res.status(409).json({error:'Ya existe un registro con ese identificador, nombre o correo.'});
  if(err.name==='SequelizeValidationError')return res.status(400).json({error:'Revisa los campos obligatorios y sus valores.'});
  if(err.name==='SequelizeForeignKeyConstraintError')return res.status(409).json({error:'La operación afecta registros relacionados y no puede completarse.'});
  const status = err.status || 500;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({ error: status >= 500 ? 'Error interno del servidor.' : err.message });
}

module.exports = { notFoundHandler, errorHandler };
