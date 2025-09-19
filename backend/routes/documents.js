const express = require('express');
const { body } = require('express-validator');
const documentsController = require('../controllers/documentsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Validaciones
const documentValidation = [
  body('clientId').isInt().withMessage('Cliente ID es requerido'),
  body('documentType').isIn(['invoice', 'quote', 'delivery', 'proforma']).withMessage('Tipo de documento inválido'),
  body('documentDate').isDate().withMessage('Fecha de documento inválida'),
  body('currency').optional().isIn(['BGN', 'EUR', 'USD']).withMessage('Moneda inválida'),
  body('language').optional().isIn(['bg', 'es', 'en']).withMessage('Idioma inválido'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
  body('items.*.description').notEmpty().withMessage('Descripción del item es requerida'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Cantidad debe ser mayor a 0'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Precio unitario debe ser mayor o igual a 0'),
  body('items.*.vatRate').isFloat({ min: 0, max: 100 }).withMessage('Tasa de IVA inválida')
];

const statusValidation = [
  body('status').isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']).withMessage('Estado inválido')
];

// Rutas
router.get('/', documentsController.getAllDocuments);
router.get('/:id', documentsController.getDocumentById);
router.post('/', documentValidation, documentsController.createDocument);
router.put('/:id', documentValidation, documentsController.updateDocument);
router.delete('/:id', documentsController.deleteDocument);
router.get('/:id/pdf', documentsController.generatePDF);
router.patch('/:id/status', statusValidation, documentsController.updateStatus);

module.exports = router;