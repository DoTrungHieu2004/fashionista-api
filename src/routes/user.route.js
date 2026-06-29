const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const userCtrl = require('../controllers/user.controller');

// All routes require authentication
router.use(authenticate);

router.get('/me', userCtrl.getProfile);
router.put('/me', userCtrl.updateProfile);

module.exports = router;
