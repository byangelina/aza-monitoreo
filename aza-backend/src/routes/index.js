const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
const {requireAuth,requirePasswordAlreadyChanged,requireRole}=require('../middleware/auth');
router.get('/reportes',requireAuth,requirePasswordAlreadyChanged,requireRole('Supervisor','Área de Calidad'),require('../utils/asyncHandler').asyncHandler(require('../controllers/reportController').report));
router.use('/gestion', require('./managementRoutes'));
router.use('/auth', require('./authRoutes'));
router.use('/inspecciones', require('./inspeccionRoutes'));
router.use('/alarmas', require('./alarmaRoutes'));
router.use('/catalogo', require('./catalogoRoutes'));
router.use('/ingesta', require('./ingestaRoutes'));

module.exports = router;
