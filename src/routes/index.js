const express = require('express');
const router = express.Router();

// Import controllers
const healthCtrl = require('../controllers/health.controller');

// Import routes
const authRoutes = require('../routes/auth.route');

// Health & status
router.get('/health', healthCtrl.check);

// Routes
router.use('/auth', authRoutes);

module.exports = router;
