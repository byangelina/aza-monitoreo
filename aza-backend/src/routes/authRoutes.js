const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = Router();

// Complementa el bloqueo de cuenta (persistido en BD) con un límite por IP,
// para mitigar fuerza bruta distribuida contra múltiples cuentas.
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

router.post('/login', loginLimiter, asyncHandler(controller.login));
router.post('/recuperar', loginLimiter, asyncHandler(controller.recuperar));
router.post('/restablecer', asyncHandler(controller.restablecer));

router.post('/logout', requireAuth, asyncHandler(controller.logout));
router.get('/me', requireAuth, asyncHandler(controller.me));
router.post('/cambiar-password', requireAuth, asyncHandler(controller.cambiarPassword));

module.exports = router;
