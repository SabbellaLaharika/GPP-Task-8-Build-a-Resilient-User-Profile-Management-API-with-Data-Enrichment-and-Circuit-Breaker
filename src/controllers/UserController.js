const UserService = require('../services/UserService');
const Joi = require('joi');

const userService = new UserService();

// Validation Schemas
const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
});

const updateUserSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email()
}).min(1); // Ensure at least one field is provided

class UserController {
    async createUser(req, res, next) {
        try {
            const { error, value } = userSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    errorCode: 'INVALID_INPUT',
                    message: 'Validation failed',
                    details: error.details.map(d => d.message)
                });
            }

            const user = await userService.createUser(value);
            res.status(201).json(user);
        } catch (err) {
            if (err.message === 'Email already exists') {
                return res.status(409).json({
                    errorCode: 'EMAIL_DUPLICATE',
                    message: 'User with this email already exists'
                });
            }
            next(err);
        }
    }

    async getUser(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ errorCode: 'RESOURCE_NOT_FOUND', message: 'User not found' });
            }
            res.json(user);
        } catch (err) {
            next(err);
        }
    }

    async updateUser(req, res, next) {
        try {
            const { error, value } = updateUserSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    errorCode: 'INVALID_INPUT',
                    message: 'Validation failed',
                    details: error.details.map(d => d.message)
                });
            }

            const user = await userService.updateUser(req.params.id, value);
            res.json(user);
        } catch (err) {
            if (err.message === 'User not found') {
                return res.status(404).json({ errorCode: 'RESOURCE_NOT_FOUND', message: 'User not found' });
            }
            next(err);
        }
    }

    async deleteUser(req, res, next) {
        try {
            await userService.deleteUser(req.params.id);
            res.status(204).send();
        } catch (err) {
            if (err.message === 'User not found') {
                return res.status(404).json({ errorCode: 'RESOURCE_NOT_FOUND', message: 'User not found' });
            }
            next(err);
        }
    }

    async getEnrichedUser(req, res, next) {
        try {
            const data = await userService.getEnrichedUser(req.params.id);
            res.json(data);
        } catch (err) {
            if (err.message === 'User not found') {
                return res.status(404).json({ errorCode: 'RESOURCE_NOT_FOUND', message: 'User not found' });
            }
            // External service errors are handled inside UserService -> ExternalClient (fallback)
            // If a real unexpected error happens, global handler catches it.
            next(err);
        }
    }
}

module.exports = new UserController();
