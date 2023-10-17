const { Router } = require('express');
const router = Router();
const authController = require('../controller/auth.controller');
router.post('/login', authController.login);

module.exports = router;
