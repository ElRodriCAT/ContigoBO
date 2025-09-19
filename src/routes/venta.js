const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.get('/', ventaController.listar);
router.post('/', ventaController.crear);
router.delete('/:id', ventaController.eliminar);

module.exports = router;
