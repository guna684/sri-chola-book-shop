import Razorpay from 'razorpay';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Razorpay instance
let razorpayInstance = null;

const initializeRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn('⚠️ Razorpay credentials not configured. Payment features will be disabled.');
        return null;
    }

    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('✅ Razorpay SDK initialized successfully');
    }

    return razorpayInstance;
};

// @desc    Generate Razorpay Order
// @route   POST /api/payment/create-session
// @access  Private
const createPaymentSession = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Initialize Razorpay
    const razorpay = initializeRazorpay();
    if (!razorpay) {
        res.status(503);
        throw new Error('Payment service not configured');
    }

    try {
        const options = {
            amount: Math.round(order.totalPrice * 100), // Amount in paise
            currency: "INR",
            receipt: order._id.toString().slice(-20), // Razorpay receipt max 40 chars
            payment_capture: 1,
            notes: {
                order_id: order._id.toString(),
                customer_name: order.user?.name || 'Customer',
                customer_email: order.user?.email || '',
                items: order.orderItems.map(i => `${i.title} x${i.qty}`).join(', ').slice(0, 200)
            }
        };

        console.log('📝 Creating Razorpay order:', {
            orderId: order._id,
            amount: options.amount,
            currency: options.currency,
            notes: options.notes
        });

        // Create order using Razorpay SDK
        const razorpayOrder = await razorpay.orders.create(options);

        console.log('✅ Razorpay order created:', razorpayOrder.id);

        res.json({
            order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
            customer_email: order.user?.email || '',
            customer_name: order.user?.name || ''
        });

    } catch (error) {
        console.error('❌ Razorpay order creation failed:', error.error || error.message);
        res.status(500);
        throw new Error(error.error?.description || 'Razorpay order creation failed');
    }
});

// @desc    Verify Payment Status
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, customer_email } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
        res.status(503);
        throw new Error('Payment verification service not configured');
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    console.log('🔐 Payment Verification:', {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        signatureMatch: expectedSignature === razorpay_signature
    });

    if (expectedSignature === razorpay_signature) {
        // Use findByIdAndUpdate for atomic robust update
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                isPaid: true,
                paidAt: Date.now(),
                paymentResult: {
                    id: razorpay_payment_id,
                    razorpay_order_id: razorpay_order_id,
                    status: 'success',
                    update_time: Date.now().toString(),
                    email_address: customer_email || ""
                }
            },
            { new: true } // Return the updated doc
        );

        if (updatedOrder) {
            console.log(`✅ Payment verified successfully for Order ${orderId} | Razorpay ID: ${razorpay_payment_id}`);
            res.json({ message: "Payment Verified", verified: true });
        } else {
            console.error(`❌ Order not found during update: ${orderId}`);
            res.status(404);
            throw new Error("Order not found");
        }
    } else {
        console.error('❌ Payment verification failed: Signature mismatch');
        res.status(400);
        throw new Error("Invalid signature");
    }
});

// @desc    Create Razorpay order for COD Cancellation Charge
// @route   POST /api/payment/cancel-charge-session
// @access  Private
const createCancellationChargeSession = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('user');

    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.status !== 'Cancellation Pending') {
        res.status(400); throw new Error('Order is not in Cancellation Pending state');
    }
    if (!order.cancellationCharge || order.cancellationCharge <= 0) {
        res.status(400); throw new Error('No cancellation charge set for this order');
    }

    const razorpay = initializeRazorpay();
    if (!razorpay) { res.status(503); throw new Error('Payment service not configured'); }

    try {
        const options = {
            amount: Math.round(order.cancellationCharge * 100), // paise
            currency: 'INR',
            receipt: `cancelcharge-${order._id.toString().slice(-16)}`,
            payment_capture: 1,
            notes: {
                type: 'COD_CANCELLATION_CHARGE',
                order_id: order._id.toString(),
                customer_name: order.user?.name || 'Customer',
                customer_email: order.user?.email || '',
            },
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Store the Razorpay order ID so we can verify later
        order.cancellationRazorpayOrderId = razorpayOrder.id;
        await order.save();

        console.log(`✅ Cancellation charge Razorpay order created: ${razorpayOrder.id} for Order ${orderId}`);

        res.json({
            order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
            customer_email: order.user?.email || '',
            customer_name: order.user?.name || '',
        });
    } catch (error) {
        console.error('❌ Razorpay cancel-charge order creation failed:', error.error || error.message);
        res.status(500);
        throw new Error(error.error?.description || 'Razorpay order creation failed');
    }
});

// @desc    Verify COD Cancellation Charge Payment
// @route   POST /api/payment/verify-cancel-charge
// @access  Private
const verifyCancellationChargePayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
        res.status(503); throw new Error('Payment verification service not configured');
    }

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        console.error('❌ Cancellation charge payment verification failed: Signature mismatch');
        res.status(400); throw new Error('Invalid payment signature');
    }

    const order = await Order.findById(orderId);
    if (!order) { res.status(404); throw new Error('Order not found'); }

    const now = new Date();
    order.status = 'Cancelled';
    order.cancelledAt = now;
    order.cancelledBy = 'user';
    order.cancellationChargeStatus = 'Paid';
    order.cancellationPaymentMethod = 'Online';
    order.cancellationConfirmedAt = now;
    order.cancellationPaidAt = now;
    order.cancellationDueDate = null;

    await order.save();

    console.log(`✅ COD cancellation charge verified & order ${orderId} marked Cancelled. Payment: ${razorpay_payment_id}`);
    res.json({ message: 'Payment verified. Order cancelled.', verified: true });
});

export { createPaymentSession, verifyPayment, createCancellationChargeSession, verifyCancellationChargePayment };
