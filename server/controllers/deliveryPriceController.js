import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

// @desc    Update shipping price and delivery contact for a single order
// @route   PUT /api/orders/:id/shipping
// @access  Private/Admin
const updateOrderShipping = asyncHandler(async (req, res) => {
    const { shippingPrice, shippingNote, updatedBy, deliveryContactNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Store the old shipping price for audit
    const oldShippingPrice = order.shippingPrice;

    // Update shipping price
    order.shippingPrice = shippingPrice;
    
    // Update delivery contact number if provided
    if (deliveryContactNumber !== undefined) {
        order.shippingAddress.deliveryContactNumber = deliveryContactNumber;
    }
    
    // Update total price
    order.totalPrice = order.itemsPrice + order.taxPrice + order.shippingPrice - (order.discountAmount || 0);

    // Add shipping update history
    if (!order.shippingUpdateHistory) {
        order.shippingUpdateHistory = [];
    }
    
    order.shippingUpdateHistory.push({
        oldPrice: oldShippingPrice,
        newPrice: shippingPrice,
        updatedBy: updatedBy || 'admin',
        note: shippingNote || '',
        updatedAt: new Date()
    });

    const updatedOrder = await order.save();

    res.json({
        success: true,
        message: 'Shipping information updated successfully',
        order: updatedOrder
    });
});

// @desc    Bulk update shipping prices for multiple orders
// @route   POST /api/orders/bulk-shipping-update
// @access  Private/Admin
const bulkUpdateShipping = asyncHandler(async (req, res) => {
    const { orderIds, shippingPrice, shippingNote, updatedBy } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        res.status(400);
        throw new Error('Please provide valid order IDs');
    }

    const updatePromises = orderIds.map(async (orderId) => {
        const order = await Order.findById(orderId);
        
        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }

        const oldShippingPrice = order.shippingPrice;
        
        // Update shipping price
        order.shippingPrice = shippingPrice;
        
        // Update total price
        order.totalPrice = order.itemsPrice + order.taxPrice + order.shippingPrice - (order.discountAmount || 0);

        // Add shipping update history
        if (!order.shippingUpdateHistory) {
            order.shippingUpdateHistory = [];
        }
        
        order.shippingUpdateHistory.push({
            oldPrice: oldShippingPrice,
            newPrice: shippingPrice,
            updatedBy: updatedBy || 'admin',
            note: shippingNote || '',
            updatedAt: new Date()
        });

        return order.save();
    });

    try {
        const updatedOrders = await Promise.all(updatePromises);
        
        res.json({
            success: true,
            message: `Updated shipping price for ${updatedOrders.length} orders`,
            updatedCount: updatedOrders.length,
            orders: updatedOrders
        });
    } catch (error) {
        res.status(400);
        throw new Error(`Bulk update failed: ${error.message}`);
    }
});

// @desc    Get shipping update history for an order
// @route   GET /api/orders/:id/shipping-history
// @access  Private/Admin
const getShippingHistory = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    res.json({
        success: true,
        shippingHistory: order.shippingUpdateHistory || [],
        currentShippingPrice: order.shippingPrice
    });
});

// @desc    Get shipping analytics
// @route   GET /api/orders/shipping-analytics
// @access  Private/Admin
const getShippingAnalytics = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    // Calculate analytics
    const totalOrders = orders.length;
    const totalShippingRevenue = orders.reduce((sum, order) => sum + order.shippingPrice, 0);
    const averageShippingPrice = totalOrders > 0 ? totalShippingRevenue / totalOrders : 0;
    
    // Group by shipping price ranges
    const shippingRanges = {
        '0-50': 0,
        '51-100': 0,
        '101-200': 0,
        '201-500': 0,
        '500+': 0
    };

    orders.forEach(order => {
        if (order.shippingPrice === 0) shippingRanges['0-50']++;
        else if (order.shippingPrice <= 50) shippingRanges['0-50']++;
        else if (order.shippingPrice <= 100) shippingRanges['51-100']++;
        else if (order.shippingPrice <= 200) shippingRanges['101-200']++;
        else if (order.shippingPrice <= 500) shippingRanges['201-500']++;
        else shippingRanges['500+']++;
    });

    // Recent shipping updates
    const recentUpdates = orders
        .filter(order => order.shippingUpdateHistory && order.shippingUpdateHistory.length > 0)
        .flatMap(order => 
            order.shippingUpdateHistory.map(update => ({
                orderId: order._id,
                ...update.toObject()
            }))
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10);

    res.json({
        success: true,
        analytics: {
            totalOrders,
            totalShippingRevenue,
            averageShippingPrice: Math.round(averageShippingPrice * 100) / 100,
            shippingRanges,
            recentUpdates
        }
    });
});

export {
    updateOrderShipping,
    bulkUpdateShipping,
    getShippingHistory,
    getShippingAnalytics
};
