import { Router } from 'express';
import chatbotController from '../controllers/chatbotController';
import { validate } from '../middlewares/validation';
import { body } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/chatbot/chat
 * @desc    Chat with AI assistant
 * @access  Public
 */
router.post(
    '/chat',
    [
        body('message')
            .notEmpty()
            .withMessage('Message is required')
            .isString()
            .withMessage('Message must be a string')
            .isLength({ max: 1000 })
            .withMessage('Message must not exceed 1000 characters'),
    ],
    validate,
    chatbotController.chat
);

export default router;
