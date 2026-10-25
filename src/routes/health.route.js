'use strict';

const express = require('express');
const router = express.Router();

const healthCtrl = require('../controllers/health.controller');

router.get('/', healthCtrl.health);
router.get('/live', healthCtrl.live);
router.get('/ready', healthCtrl.ready);

module.exports = router;
