const { Router } = require('express');
const router = Router();
const userController = require('../controller/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
router.post('/', userController.createUser);
router.delete('/:id', authMiddleware, userController.deleteUserById);
router.patch('/:id', authMiddleware, userController.updateUserById);
router.get('/:id', authMiddleware, userController.getUserById);

module.exports = router;
