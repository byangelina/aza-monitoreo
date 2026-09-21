const { Router } = require('express');
const controller = require('../controllers/inspeccionController');
const { requireAuth, requirePasswordAlreadyChanged, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();
router.use(requireAuth, requirePasswordAlreadyChanged);

// Operador: última inspección / ventana operativa reciente (no histórico general).
router.get('/recientes', requireRole('Operador'), asyncHandler(controller.listarRecientes));

// Supervisor, Área de Calidad y Administrador: histórico filtrado y trazabilidad.
router.get('/', requireRole('Supervisor', 'Área de Calidad', 'Administrador'), asyncHandler(controller.listarHistorico));

// Detalle: cualquier rol autenticado (lo usan tanto el panel del Operador como el del Supervisor).
router.get('/:id', asyncHandler(controller.obtenerDetalle));

// RF012: agregar observación — función exclusiva del Operador.
router.post('/:id/observaciones', requireRole('Operador'), asyncHandler(controller.agregarObservacion));

module.exports = router;
