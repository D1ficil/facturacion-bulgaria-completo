const express = require('express');
const { body } = require('express-validator');
const productsController = require('../controllers/productsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación
router.use(authMiddleware);

// Validaciones
const productValidation = [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('code').optional().isLength({ min: 1 }).withMessage('El código no puede estar vacío'),
  body('price').isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
  body('vatRate').isFloat({ min: 0, max: 100 }).withMessage('La tasa de IVA debe estar entre 0 y 100'),
  body('unit').optional().notEmpty().withMessage('La unidad no puede estar vacía')
];

// Rutas
router.get('/', productsController.getAllProducts);
router.get('/active', productsController.getActiveProducts);
router.get('/:id', productsController.getProductById);
router.post('/', productValidation, productsController.createProduct);
router.put('/:id', productValidation, productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

module.exports = router;