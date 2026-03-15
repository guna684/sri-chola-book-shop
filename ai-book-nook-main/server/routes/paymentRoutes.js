import express from 'express';
const router = express.Router();
import {
    createPaymentSession,
    verifyPayment,
    createCancellationChargeSession,
    verifyCancellationChargePayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/create-session', protect, createPaymentSession);
router.post('/verify', protect, verifyPayment);

// ── COD Cancellation Charge Payment ─────────────────────────────────────────
router.post('/cancel-charge-session', protect, createCancellationChargeSession);
router.post('/verify-cancel-charge', protect, verifyCancellationChargePayment);

export default router;
