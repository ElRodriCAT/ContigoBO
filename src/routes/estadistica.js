const express = require('express');
const router = express.Router();
const estadisticaController = require('../controllers/estadisticaController');

router.get('/', estadisticaController.obtenerEstadisticas);

module.exports = router;