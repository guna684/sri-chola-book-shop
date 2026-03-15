/**
 * Cancellation Charge Auto-Expiry Scheduler
 *
 * Runs every 60 minutes.
 * Finds all orders where:
 *   - status = 'Cancellation Pending'
 *   - cancellationDueDate < now
 *
 * Action taken:
 *   - Revert status → 'Processing'
 *   - Mark cancellationChargeStatus → 'Expired'
 *   - Clear all cancellation-pending fields so user gets a clean slate
 */

import Order from './models/Order.js';

const SCHEDULER_INTERVAL_MS = 1 * 60 * 1000; // 1 minute

async function expireOverdueCancellations() {
    try {
        const now = new Date();

        const expired = await Order.find({
            status: { $in: ['Cancellation Pending', 'Cancelled'] },
            cancellationChargeStatus: 'Pending',
            cancellationDueDate: { $lt: now },
        });

        if (expired.length === 0) {
            console.log(`[Scheduler] ${now.toISOString()} – No overdue cancellation requests.`);
            return;
        }

        console.log(`[Scheduler] ${now.toISOString()} – Found ${expired.length} overdue COD cancellation(s). Reverting…`);

        for (const order of expired) {
            order.status = 'Processing';
            order.cancellationChargeStatus = 'Expired';
            // Clear only the fields that would block a future cancellation attempt
            // but keep the charge amount and type for record-keeping/admin view
            order.cancellationDueDate = null;
            order.cancellationRequestedAt = null;
            order.cancellationRazorpayOrderId = null;
            order.cancellationPaymentMethod = null;

            await order.save();
            console.log(`[Scheduler]   ↺ Order ${order._id} reverted to Processing (COD charge expired)`);
        }
    } catch (err) {
        console.error('[Scheduler] Error during expiry check:', err.message);
    }
}

export function startCancellationScheduler() {
    console.log('[Scheduler] COD cancellation expiry scheduler started (interval: 60 min)');
    // Run immediately on startup to catch any that expired while server was down
    expireOverdueCancellations();
    // Then run every hour
    setInterval(expireOverdueCancellations, SCHEDULER_INTERVAL_MS);
}
