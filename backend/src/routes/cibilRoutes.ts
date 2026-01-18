import express from 'express';
import { getCibilScore, updateCibilScore, getCibilHistory } from '../controllers/cibilController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/cibil
 * @desc    Get user's latest CIBIL score
 * @access  Private
 */
router.get('/', getCibilScore);

/**
 * @route   POST /api/cibil/update
 * @desc    Update/recalculate CIBIL score
 * @access  Private
 */
router.post('/update', updateCibilScore);

/**
 * @route   GET /api/cibil/history
 * @desc    Get CIBIL score history
 * @access  Private
 */
router.get('/history', getCibilHistory);

export default router;
