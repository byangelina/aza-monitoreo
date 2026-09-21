const { Router } = require('express');
const controller = require('../controllers/ingestaController');
const { requireApiKey } = require('../middleware/apiKeyAuth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();

// RF047 / INT15: recurso técnico del actor externo (Sistema de captura/simulador).
// No usa JWT de sesión humana: se autentica con API Key (RNF004).
router.post('/inspecciones', requireApiKey, asyncHandler(controller.registrarInspeccion));

module.exports = router;
