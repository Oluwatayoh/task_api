// userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Define user routes


/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal Server Error
 */
router.post('/login', UserController.createUser);

module.exports = router;
