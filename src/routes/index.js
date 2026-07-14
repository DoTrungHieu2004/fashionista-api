const express = require('express');
const router = express.Router();

// Import controllers
const healthCtrl = require('../controllers/health.controller');

// Import routes
const authRoutes = require('../routes/auth.route');
const userRoutes = require('../routes/user.route');
const categoryRoutes = require('../routes/category.route');
const brandRoutes = require('../routes/brand.route');
const productRoutes = require('../routes/product.route');

// Health & status
router.get('/health', healthCtrl.check);

// Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);

module.exports = router;
