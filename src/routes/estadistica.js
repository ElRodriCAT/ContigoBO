const express = require('express');
const router = express.Router();
const estadisticaController = require('../controllers/estadisticaController');

router.get('/', estadisticaController.obtenerEstadisticas);
router.get('/exportar', estadisticaController.exportarExcel);

module.exports = router;