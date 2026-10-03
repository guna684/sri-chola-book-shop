import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import sendEmail from '../utils/sendEmail.js';
import { generateInvoiceTemplate } from '../utils/invoiceTemplate.js';
import PromoCode from '../models/PromoCode.js';
import PromoCodeUsage from '../models/PromoCodeUsage.js';
import { getDeliveredDateRangeFilter, getDashboardStatsFilter } from '../utils/orderFilters.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        promoCodeId,
        discountAmount,
        shippingDetails // Optional: shipping calculation details
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        // If promo code is provided, re-validate it
        let validatedPromoCode = null;
        let validatedDiscount = 0;

        if (promoCodeId) {
            const promoCode = await PromoCode.findById(promoCodeId);

            if (!promoCode) {
                res.status(400);
                throw new Error('Invalid promo code');
            }

            // Re-validate promo code
            if (!promoCode.isActive) {
                res.status(400);
                throw new Error('Promo code is no longer active');
            }

            if (promoCode.expiryDate < new Date()) {
                res.status(400);
                throw new Error('Promo code has expired');
            }

            if (promoCode.usedCount >= promoCode.usageLimit) {
                res.status(400);
                throw new Error('Promo code usage limit reached');
            }

            // Check user usage
            const userUsageCount = await PromoCodeUsage.getUserUsageCount(
                promoCode._id,
                req.user._id
            );

            if (userUsageCount >= promoCode.perUserLimit) {
                res.status(400);
                throw new Error('You have already used this promo code');
            }

            // Calculate and verify discount
            const discountResult = promoCode.calculateDiscount(itemsPrice + taxPrice + shippingPrice);

            if (!discountResult.valid) {
                res.status(400);
                throw new Error(discountResult.message);
            }

            validatedPromoCode = promoCode;
            validatedDiscount = discountResult.discount;
        }

        // Check stock and deduct
        for (const item of orderItems) {
            const book = await Book.findById(item.product);
            if (!book) {
                res.status(404);
                throw new Error(`Book not found: ${item.title}`);
            }
            if (book.stock < item.qty) {
                res.status(400);
                throw new Error(`Not enough stock for ${item.title}`);
            }
            book.stock -= item.qty;
            await book.save();
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            promoCode: validatedPromoCode ? validatedPromoCode._id : null,
            discountAmount: validatedDiscount,
            // Store shipping calculation details if provided
            shippingDetails: shippingDetails || null
        });

        const createdOrder = await order.save();

        // If promo code was used, record usage and increment count
        if (validatedPromoCode) {
            // Create usage record
            await PromoCodeUsage.create({
                promoCode: validatedPromoCode._id,
                user: req.user._id,
                order: createdOrder._id,
                discountAmount: validatedDiscount
            });

            // Increment used count
            validatedPromoCode.usedCount += 1;
            await validatedPromoCode.save();
        }

        // Send Email with Invoice
        const invoiceHtml = generateInvoiceTemplate(createdOrder, req.user);

        // Fire and forget, don't await/block response
        sendEmail({
            to: req.user.email,
            subject: `Invoice for Order #${createdOrder._id} - Sri Chola Book Shop`,
            html: invoiceHtml
        }).catch(err => console.error('Failed to send invoice email:', err));

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'delivered';

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get dashboard stats
// @route   GET /api/orders/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    // Use dashboard stats filter (non-cancelled orders)
    const statsFilter = getDashboardStatsFilter(startDate, endDate);

    const orders = await Order.find(statsFilter);
    const users = await User.countDocuments({ isAdmin: false }); // All time, not date-filtered
    const books = await Book.countDocuments();

    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const totalPaidOrders = orders.length;

    console.log('📊 Dashboard Stats (using dashboard filter):');
    console.log('   Filter:', statsFilter);
    console.log('   Total Orders:', totalOrders);
    console.log('   Total Sales:', totalSales);

    res.json({
        totalOrders,
        totalSales,
        totalPaidOrders,
        totalUsers: users,
        totalBooks: books
    });
});

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Not authorized to cancel this order');
        }

        if (order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Cancelled') {
            res.status(400);
            throw new Error(`Cannot cancel order that is ${order.status}`);
        }

        order.status = 'Cancelled';
        // Optional: refund logic here or manual process
        // Optional: restore stock

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const oldStatus = order.status;
        order.status = req.body.status;

        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            // Auto-mark as paid for COD orders when delivered
            order.isPaid = true;
            order.paidAt = Date.now();

            console.log('✅ Order Status Updated to Delivered:');
            console.log('   Order ID:', order._id);
            console.log('   Old Status:', oldStatus);
            console.log('   New Status:', order.status);
            console.log('   isPaid:', order.isPaid);
            console.log('   Total Price:', order.totalPrice);
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});


// COD cancellation charge config (fixed ₹50 OR 5% of order value, whichever is greater, max ₹100)
const COD_CANCELLATION_CHARGE_FIXED = 50;
const COD_CANCELLATION_CHARGE_PCT = 0.05; // 5%

const computeCODCharge = (totalPrice) => {
    const pctCharge = parseFloat((totalPrice * COD_CANCELLATION_CHARGE_PCT).toFixed(2));
    return Math.min(Math.max(pctCharge, COD_CANCELLATION_CHARGE_FIXED), 100);
};

const isCOD = (paymentMethod = '') =>
    paymentMethod.toLowerCase().includes('cod') ||
    paymentMethod.toLowerCase().includes('cash');

// @desc    Get refund preview details (Prepaid orders only)
// @route   GET /api/orders/:id/refund-preview
// @access  Private
const getRefundPreview = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401); throw new Error('Not authorized');
    }
    const nonCancellableStatuses = ['Delivered', 'Cancelled', 'Shipped'];
    if (nonCancellableStatuses.includes(order.status)) {
        res.status(400); throw new Error(`Cannot cancel an order that is ${order.status}`);
    }
    if (order.refundStatus || order.cancellationCharge != null) {
        res.status(400); throw new Error('Cancellation already initiated for this order');
    }

    const originalAmount = order.totalPrice;
    const cancellationFee = Math.min(parseFloat((originalAmount * 0.02).toFixed(2)), 50);
    const refundAmount = parseFloat((originalAmount - cancellationFee).toFixed(2));

    res.json({
        paymentType: 'Prepaid',
        originalAmount,
        cancellationFee,
        refundAmount,
        refundMethod: order.paymentMethod,
        estimatedDays: '5-7 working days',
    });
});

// @desc    Get COD cancellation charge preview
// @route   GET /api/orders/:id/cod-cancel-preview
// @access  Private
const getCODCancellationPreview = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401); throw new Error('Not authorized');
    }
    const nonCancellableStatuses = ['Delivered', 'Cancelled', 'Shipped'];
    if (nonCancellableStatuses.includes(order.status)) {
        res.status(400); throw new Error(`Cannot cancel an order that is ${order.status}`);
    }
    if (order.cancellationCharge != null) {
        res.status(400); throw new Error('Cancellation already initiated for this order');
    }

    const orderTotal = order.totalPrice;

    res.json({
        paymentType: 'COD',
        orderTotal,
        codHandlingCharge: 0,
        cancellationCharge: 0,
        totalCharges: 0,
        message: `This order was placed using Cash on Delivery. If you cancel now, an admin will review the request and assess a cancellation charge. Once assessed, you will be able to pay it online.`,
    });
});

// @desc    Confirm cancellation – handles both Prepaid and COD
// @route   PUT /api/orders/:id/confirm-cancel
// @access  Private
const confirmCancellation = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401); throw new Error('Not authorized to cancel this order');
    }
    const nonCancellableStatuses = ['Delivered', 'Cancelled', 'Shipped'];
    if (nonCancellableStatuses.includes(order.status)) {
        res.status(400); throw new Error(`Cannot cancel an order that is ${order.status}`);
    }
    if (order.refundStatus || order.cancellationCharge != null) {
        res.status(400); throw new Error('Cancellation already initiated for this order');
    }

    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = 'user';

    if (isCOD(order.paymentMethod)) {
        // COD – record charge, no refund
        const codCharge = computeCODCharge(order.totalPrice);
        const dueDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
        order.cancellationType = 'COD';
        order.cancellationCharge = codCharge;
        order.cancellationChargeStatus = 'Pending';
        order.cancellationDueDate = dueDate;
        order.cancellationReason = 'User Cancelled (COD)';
    } else {
        // Prepaid – compute refund
        const originalAmount = order.totalPrice;
        const cancellationFee = Math.min(parseFloat((originalAmount * 0.02).toFixed(2)), 50);
        const refundAmount = parseFloat((originalAmount - cancellationFee).toFixed(2));
        order.cancellationType = 'Prepaid';
        order.refundStatus = 'Pending';
        order.refundDetails = {
            originalAmount,
            cancellationFee,
            refundAmount,
            refundMethod: order.paymentMethod,
            estimatedDays: '5-7 working days',
            adminNotes: '',
            transactionId: order.paymentResult?.id || '',
        };
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Admin updates COD cancellation charge (amount, status, remarks, paid date)
// @route   PUT /api/orders/:id/cod-charge
// @access  Private/Admin
const updateCancellationCharge = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }

    const { cancellationChargeStatus, chargeRemarks, cancellationCharge, cancellationPaidAt, cancellationDueDate } = req.body;

    if (cancellationCharge !== undefined) order.cancellationCharge = cancellationCharge;

    if (cancellationDueDate !== undefined) {
        order.cancellationDueDate = cancellationDueDate ? new Date(cancellationDueDate) : null;
    }

    if (cancellationChargeStatus) {
        order.cancellationChargeStatus = cancellationChargeStatus;
        // If admin marks as Paid
        if (cancellationChargeStatus === 'Paid') {
            if (!order.cancellationPaidAt) {
                order.cancellationPaidAt = cancellationPaidAt ? new Date(cancellationPaidAt) : new Date();
            }
            // If it was Pending cancellation, finalize it
            if (order.status === 'Cancellation Pending') {
                order.status = 'Cancelled';
                order.cancelledAt = order.cancellationPaidAt || new Date();
                order.cancelledBy = 'admin';
                order.cancellationConfirmedAt = new Date();
                order.cancellationDueDate = null;
            }
        }
        // If marking Waived and order is still Cancellation Pending, auto-cancel it
        if (cancellationChargeStatus === 'Waived' && order.status === 'Cancellation Pending') {
            order.status = 'Cancelled';
            order.cancelledAt = new Date();
            order.cancelledBy = 'admin';
            order.cancellationDueDate = null;
            order.cancellationConfirmedAt = new Date();
        }
    }
    if (chargeRemarks !== undefined) order.chargeRemarks = chargeRemarks;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// ────────────────────────────────────────────────────────────────────────────
// COD PAYMENT-GATED CANCELLATION
// ────────────────────────────────────────────────────────────────────────────

// @desc    Step 1 – Initiate COD cancellation (does NOT cancel immediately)
// @route   PUT /api/orders/:id/initiate-cod-cancel
// @access  Private
const initiateCODCancellation = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401); throw new Error('Not authorized');
    }

    const nonCancellableStatuses = ['Delivered', 'Cancelled', 'Shipped', 'Cancellation Pending'];
    if (nonCancellableStatuses.includes(order.status)) {
        res.status(400); throw new Error(`Cannot initiate cancellation for an order that is ${order.status}`);
    }

    order.status = 'Cancellation Pending';
    order.cancellationType = 'COD';
    order.cancellationCharge = null; // Admin sets this later
    order.cancellationChargeStatus = 'Pending';
    order.cancellationDueDate = null; // Admin sets this later
    order.cancellationRequestedAt = new Date();
    order.cancellationReason = 'User Initiated (COD)';

    const updatedOrder = await order.save();

    res.json({
        ...updatedOrder.toObject(),
        message: 'Cancellation initiated. Awaiting admin charge assessment.',
    });
});

// @desc    Step 1b – Revert COD cancellation request (user clicks Cancel Request)
// @route   PUT /api/orders/:id/revert-cod-cancel
// @access  Private
const revertCODCancellation = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401); throw new Error('Not authorized');
    }
    if (order.status !== 'Cancellation Pending') {
        res.status(400); throw new Error('Order is not in Cancellation Pending state');
    }

    order.status = 'Processing';
    order.cancellationCharge = null;
    order.cancellationChargeStatus = null;
    order.cancellationType = null;
    order.cancellationDueDate = null;
    order.cancellationRequestedAt = null;
    order.cancellationRazorpayOrderId = null;
    order.cancellationReason = null;
    order.cancellationPaymentMethod = null;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Step 2b – User selects COD Recovery mode (cancel now, charge recovered on next order)
// @route   PUT /api/orders/:id/cod-recovery-cancel
// @access  Private
const selectCODRecovery = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(401); throw new Error('Not authorized');
    }
    if (order.status !== 'Cancellation Pending') {
        res.status(400); throw new Error('Order is not in Cancellation Pending state');
    }

    const now = new Date();
    order.status = 'Cancelled';
    order.cancelledAt = now;
    order.cancelledBy = 'user';
    order.cancellationPaymentMethod = 'COD Recovery';
    order.cancellationConfirmedAt = now;
    // Charge remains Pending until recovered on next order
    order.cancellationChargeStatus = 'Pending';
    order.cancellationDueDate = null;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Admin override – force cancel or force continue a Cancellation Pending order
// @route   PUT /api/orders/:id/admin-cod-override
// @access  Private/Admin
const adminOverrideCODCancellation = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }

    const { action, remarks } = req.body;
    if (!['force-cancel', 'force-continue'].includes(action)) {
        res.status(400); throw new Error('action must be force-cancel or force-continue');
    }

    if (remarks) order.chargeRemarks = remarks;
    const now = new Date();

    if (action === 'force-cancel') {
        order.status = 'Cancelled';
        order.cancelledAt = now;
        order.cancelledBy = 'admin';
        order.cancellationChargeStatus = 'Waived';
        order.cancellationConfirmedAt = now;
        order.cancellationDueDate = null;
    } else {
        // force-continue: revert to Processing
        order.status = 'Processing';
        order.cancellationChargeStatus = 'Expired';
        order.cancellationCharge = null;
        order.cancellationDueDate = null;
        order.cancellationRequestedAt = null;
        order.cancellationRazorpayOrderId = null;
        order.cancellationPaymentMethod = null;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Admin updates refund info (amount, status, notes, transactionId)
// @route   PUT /api/orders/:id/refund
// @access  Private/Admin
const updateRefund = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.refundStatus === 'Processed') {
        res.status(400); throw new Error('Refund is already processed and cannot be modified');
    }
    const { refundAmount, refundStatus, adminNotes, transactionId } = req.body;
    if (refundAmount !== undefined) {
        order.refundDetails.refundAmount = refundAmount;
        if (order.refundDetails.originalAmount !== undefined) {
            order.refundDetails.cancellationFee = order.refundDetails.originalAmount - refundAmount;
        }
    }
    if (adminNotes !== undefined) order.refundDetails.adminNotes = adminNotes;
    if (transactionId !== undefined) order.refundDetails.transactionId = transactionId;
    if (refundStatus) order.refundStatus = refundStatus;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Serve order invoice as HTML (user opens in new tab, prints to PDF)
// @route   GET /api/orders/:id/invoice
// @access  Private
const getOrderInvoice = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(403); throw new Error('Not authorised');
    }
    const html = generateInvoiceTemplate(order, order.user);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

// @desc    Delete order permanently
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }
    await Order.deleteOne({ _id: order._id });
    res.json({ message: 'Order deleted successfully' });
});


export {

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
};

