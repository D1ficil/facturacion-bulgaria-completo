const express = require('express');
const { body } = require('express-validator');
const clientsController = require('../controllers/clientsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación
router.use(authMiddleware);

// Validaciones
const clientValidation = [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('eik').isLength({ min: 9, max: 13 }).withMessage('EIK debe tener entre 9 y 13 caracteres'),
  body('address').notEmpty().withMessage('La dirección es requerida'),
  body('city').notEmpty().withMessage('La ciudad es requerida'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('vatNumber').optional().isLength({ min: 9 }).withMessage('Número de IVA inválido')
];

// Rutas
router.get('/', clientsController.getAllClients);
router.get('/active', clientsController.getActiveClients);
router.get('/:id', clientsController.getClientById);
router.post('/', clientValidation, clientsController.createClient);
router.put('/:id', clientValidation, clientsController.updateClient);
router.delete('/:id', clientsController.deleteClient);

module.exports = router;