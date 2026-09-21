// Express 4 no reenvía automáticamente un rechazo de promesa desde un handler async
// hacia el middleware de errores: sin este wrapper, una excepción no capturada (p. ej.
// un error de validación de Sequelize) escapa como unhandledRejection y tumba el proceso
// completo del servidor para todos los usuarios, no solo la request que falló.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { asyncHandler };
