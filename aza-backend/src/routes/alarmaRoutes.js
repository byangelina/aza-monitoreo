const { Router } = require('express');
const controller = require('../controllers/alarmaController');
const { requireAuth, requirePasswordAlreadyChanged, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();
router.use(requireAuth, requirePasswordAlreadyChanged, requireRole('Operador', 'Supervisor'));

router.get('/', asyncHandler(controller.listar));
router.post('/:id/reconocer', asyncHandler(controller.reconocer));

module.exports = router;
