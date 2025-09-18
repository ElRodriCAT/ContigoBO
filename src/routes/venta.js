const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.get('/', ventaController.listar);
router.post('/', ventaController.crear);

module.exports = router;
