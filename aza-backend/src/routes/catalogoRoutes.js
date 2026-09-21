const { Router } = require('express');
const controller = require('../controllers/catalogoController');
const { requireAuth, requirePasswordAlreadyChanged, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();
// Lectura de catálogo también habilitada para el Operador: su propio dashboard necesita
// resolver nombres de receta/lote/batch para lo que ya ve en sus inspecciones (consulta básica).
router.use(requireAuth, requirePasswordAlreadyChanged, requireRole('Operador', 'Supervisor', 'Área de Calidad', 'Administrador'));

router.get('/recetas', asyncHandler(controller.listarRecetas));
router.get('/lotes', asyncHandler(controller.listarLotes));
router.get('/batches', asyncHandler(controller.listarBatches));

module.exports = router;
