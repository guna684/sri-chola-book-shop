import express from 'express';
import {
    updateOrderShipping,
    bulkUpdateShipping,
    getShippingHistory,
    getShippingAnalytics
} from '../controllers/deliveryPriceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(admin);

// Single order shipping management
router.put('/:id/shipping', updateOrderShipping);
router.get('/:id/shipping-history', getShippingHistory);

// Bulk operations and analytics
router.post('/bulk-shipping-update', bulkUpdateShipping);
router.get('/shipping-analytics', getShippingAnalytics);

export default router;
