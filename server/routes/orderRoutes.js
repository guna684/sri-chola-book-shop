import express from 'express';
const router = express.Router();
import { 
    addOrderItems, 
    getOrderById, 
    updateOrderToPaid, 
    updateOrderToDelivered, 
    getMyOrders,
    getOrders, 
    getDashboardStats,
    cancelOrder,
    updateOrderStatus,
    getRefundPreview,
    getCODCancellationPreview,
    confirmCancellation,
    updateCancellationCharge,
    updateRefund,
    initiateCODCancellation,
    revertCODCancellation,
    selectCODRecovery,
    adminOverrideCODCancellation,
    getOrderInvoice,
    deleteOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/stats').get(protect, admin, getDashboardStats);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById).delete(protect, admin, deleteOrder);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/refund-preview').get(protect, getRefundPreview);
router.route('/:id/cod-cancel-preview').get(protect, getCODCancellationPreview);
router.route('/:id/confirm-cancel').put(protect, confirmCancellation);
router.route('/:id/refund').put(protect, admin, updateRefund);
router.route('/:id/cod-charge').put(protect, admin, updateCancellationCharge);

// ── Payment-Gated COD Cancellation ──────────────────────────────────────────
router.route('/:id/initiate-cod-cancel').put(protect, initiateCODCancellation);
router.route('/:id/revert-cod-cancel').put(protect, revertCODCancellation);
router.route('/:id/cod-recovery-cancel').put(protect, selectCODRecovery);
router.route('/:id/admin-cod-override').put(protect, admin, adminOverrideCODCancellation);
router.route('/:id/invoice').get(protect, getOrderInvoice);

export default router;
