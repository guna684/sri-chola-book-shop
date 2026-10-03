import asyncHandler from 'express-async-handler';
import { calculateOrderShipping, calculateOrderShippingFallback } from '../utils/shippingCalculator.js';
import Book from '../models/Book.js';

// @desc    Calculate shipping cost for order
// @route   POST /api/shipping/calculate
// @access  Public
const calculateShipping = asyncHandler(async (req, res) => {
    const { shippingAddress, orderItems } = req.body;

    if (!shippingAddress || !orderItems || !Array.isArray(orderItems)) {
        res.status(400);
        throw new Error('Please provide shipping address and order items');
    }

    try {
        // Fetch book details to get pages for weight calculation
        const enrichedOrderItems = await Promise.all(
            orderItems.map(async (item) => {
                const book = await Book.findById(item.product);
                if (book) {
                    return {
                        ...item,
                        pages: book.pages || 336, // Default to 336 pages if not specified
                        title: book.title
                    };
                }
                return {
                    ...item,
                    pages: 336, // Default pages for unknown books
                    title: 'Unknown Book'
                };
            })
        );

        console.log('Enriched order items:', enrichedOrderItems);

        // Always use pincode-based calculation for more accurate results
        const shippingResult = calculateOrderShippingFallback(shippingAddress, enrichedOrderItems);

        res.json({
            success: true,
            shippingCost: shippingResult.shippingCost,
            distance: shippingResult.distance,
            totalWeight: shippingResult.totalWeight,
            distanceCategory: shippingResult.distanceCategory,
            weightCategory: shippingResult.weightCategory,
            fallback: true,
            message: 'Calculated based on pincode distance'
        });
    } catch (error) {
        console.error('Shipping calculation error:', error);
        res.status(500);
        throw new Error('Failed to calculate shipping cost');
    }
});

// @desc    Get shipping rates table
// @route   GET /api/shipping/rates
// @access  Public
const getShippingRates = asyncHandler(async (req, res) => {
    const { SHIPPING_RATES } = await import('../utils/shippingCalculator.js');
    
    res.json({
        success: true,
        rates: SHIPPING_RATES,
        shopAddress: {
            street: "34, Sathy Main Road, Gobichettipalayam",
            city: "Erode",
            state: "Tamil Nadu",
            pincode: "638453",
            country: "India"
        }
    });
});

export {
    calculateShipping,
    getShippingRates
};
