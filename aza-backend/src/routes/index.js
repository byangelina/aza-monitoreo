const { Router } = require('express');

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', require('./authRoutes'));
router.use('/inspecciones', require('./inspeccionRoutes'));
router.use('/alarmas', require('./alarmaRoutes'));
router.use('/catalogo', require('./catalogoRoutes'));
router.use('/ingesta', require('./ingestaRoutes'));

module.exports = router;
