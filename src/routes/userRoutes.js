const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// Standard CRUD
router.post('/', (req, res, next) => userController.createUser(req, res, next));
router.get('/:id', (req, res, next) => userController.getUser(req, res, next));
router.put('/:id', (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

// Enriched Endpoint
router.get('/:id/enriched', (req, res, next) => userController.getEnrichedUser(req, res, next));

module.exports = router;
