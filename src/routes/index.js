const express = require('express');
const router = express.Router();

// Import controllers
const healthCtrl = require('../controllers/health.controller');

// Health & status
router.get('/health', healthCtrl.check);

module.exports = router;
