import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
        {
            title: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
        },
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        deliveryContactNumber: { type: String, required: false }
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
        id: { type: String },
        razorpay_order_id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },

    // Processing, Shipped, Delivered, Cancelled, Cancellation Pending
    status: { type: String, required: true, default: 'Processing' },

    promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' },
    discountAmount: { type: Number, default: 0 },

    // Shipping calculation details
    shippingDetails: {
        distance: { type: Number },
        weight: { type: Number },
        distanceCategory: { type: String },
        weightCategory: { type: String },
        message: { type: String },
        fallback: { type: Boolean, default: false }
    },

    // Shipping price update history for admin tracking
    shippingUpdateHistory: [{
        oldPrice: { type: Number, required: true },
        newPrice: { type: Number, required: true },
        updatedBy: { type: String, required: true },
        note: { type: String },
        updatedAt: { type: Date, default: Date.now }
    }],

    // ── Refund / Cancellation fields ─────────────────────────────────────────
    refundDetails: {
        originalAmount: { type: Number },
        cancellationFee: { type: Number },
        refundAmount: { type: Number },
        refundMethod: { type: String },
        estimatedDays: { type: String },
        adminNotes: { type: String },
        transactionId: { type: String },
    },
    refundStatus: {
        type: String,
        enum: ['Pending', 'Processed', 'Rejected'],
        default: null,
    },
    cancelledAt: { type: Date },
    cancelledBy: { type: String, enum: ['user', 'admin'], default: null },

    // ── COD Cancellation Charge fields ───────────────────────────────────────
    cancellationCharge: { type: Number, default: null },
    cancellationChargeStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Waived', 'Expired'],
        default: null,
    },
    cancellationType: {
        type: String,
        enum: ['Prepaid', 'COD'],
        default: null,
    },
    cancellationReason: { type: String, default: null },
    chargeRemarks: { type: String, default: null },

    // ── COD Payment-Gated Cancellation fields ────────────────────────────────
    // Payment method chosen by user for settling the cancellation charge
    cancellationPaymentMethod: {
        type: String,
        enum: ['Online', 'COD Recovery'],
        default: null,
    },
    // 48-hour deadline for the user to pay the cancellation charge
    cancellationDueDate: { type: Date, default: null },
    // When user clicked "Confirm Cancellation"
    cancellationRequestedAt: { type: Date, default: null },
    // When cancellation was actually confirmed (charge paid / recovery chosen)
    cancellationConfirmedAt: { type: Date, default: null },
    // Razorpay order id generated for the cancellation charge payment
    cancellationRazorpayOrderId: { type: String, default: null },
    // When the cancellation charge was actually settled (online payment or COD recovery)
    cancellationPaidAt: { type: Date, default: null },

}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
