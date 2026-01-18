import { Router } from 'express';
import depositController from '../controllers/depositController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/deposits
 * @desc    Get all deposits for current user
 * @access  Private
 */
router.get('/', depositController.getMyDeposits);

/**
 * @route   POST /api/deposits
 * @desc    Create a new deposit (FD/RD)
 * @access  Private
 */
router.post('/', depositController.createDeposit);

/**
 * @route   GET /api/deposits/:id
 * @desc    Get deposit by ID
 * @access  Private
 */
router.get('/:id', depositController.getDepositById);

/**
 * @route   POST /api/deposits/:id/break
 * @desc    Break deposit early
 * @access  Private
 */
router.post('/:id/break', depositController.breakDeposit);

export default router;
