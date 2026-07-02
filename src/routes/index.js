const express = require('express');
const router = express.Router();

// Import controllers
const healthCtrl = require('../controllers/health.controller');

// Import routes
const authRoutes = require('../routes/auth.route');
const userRoutes = require('../routes/user.route');
const categoryRoutes = require('../routes/category.route');

// Health & status
router.get('/health', healthCtrl.check);

// Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
