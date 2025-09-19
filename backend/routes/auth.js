const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones
const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('firstName').notEmpty().withMessage('El nombre es requerido'),
  body('lastName').notEmpty().withMessage('El apellido es requerido'),
  body('company.name').optional().notEmpty().withMessage('El nombre de la empresa es requerido'),
  body('company.eik').optional().isLength({ min: 9, max: 13 }).withMessage('EIK debe tener entre 9 y 13 caracteres'),
  body('company.address').optional().notEmpty().withMessage('La dirección es requerida'),
  body('company.city').optional().notEmpty().withMessage('La ciudad es requerida'),
  body('company.email').optional().isEmail().withMessage('Email de empresa inválido')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

const updateProfileValidation = [
  body('firstName').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('lastName').optional().notEmpty().withMessage('El apellido no puede estar vacío'),
  body('company.name').optional().notEmpty().withMessage('El nombre de la empresa no puede estar vacío'),
  body('company.eik').optional().isLength({ min: 9, max: 13 }).withMessage('EIK debe tener entre 9 y 13 caracteres'),
  body('company.email').optional().isEmail().withMessage('Email de empresa inválido')
];

// Rutas públicas
router.post('/register', registerValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);

// Rutas protegidas
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, updateProfileValidation, handleValidationErrors, authController.updateProfile);

// Verificar token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    }
  });
});

module.exports = router;