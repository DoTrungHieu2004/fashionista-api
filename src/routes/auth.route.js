const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth.controller');
const validator = require('../middleware/validator');
const validatorAuth = require('../validations/auth.validation');

// Public routes
router.post('/register', validator(validatorAuth.registerSchema), authCtrl.register);
router.post('/login', validator(validatorAuth.loginSchema), authCtrl.login);

module.exports = router;
