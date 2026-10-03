import axios from 'axios';

// Shop address
const SHOP_ADDRESS = {
    street: "34, Sathy Main Road, Gobichettipalayam",
    city: "Erode",
    state: "Tamil Nadu",
    pincode: "638453",
    country: "India"
};

// Shipping price list based on distance and weight
const SHIPPING_RATES = {
    // Distance: 0-10 km (Hyper-local delivery)
    '0-10': {
        '0-500': 20,
        '500-1000': 25,
        '1000-2000': 35,
        '2000-5000': 50,
        '5000-10000': 80,
        '10000-20000': 150
    },
    // Distance: 11-50 km (Local city delivery)
    '11-50': {
        '0-500': 25,
        '500-1000': 35,
        '1000-2000': 45,
        '2000-5000': 70,
        '5000-10000': 110,
        '10000-20000': 180
    },
    // Distance: 51-100 km
    '51-100': {
        '0-500': 35,
        '500-1000': 50,
        '1000-2000': 65,
        '2000-5000': 100,
        '5000-10000': 150,
        '10000-20000': 260
    },
    // Distance: 101-200 km
    '101-200': {
        '0-500': 45,
        '500-1000': 65,
        '1000-2000': 85,
        '2000-5000': 130,
        '5000-10000': 200,
        '10000-20000': 340
    },
    // Distance: 201-300 km
    '201-300': {
        '0-500': 55,
        '500-1000': 75,
        '1000-2000': 100,
        '2000-5000': 160,
        '5000-10000': 240,
        '10000-20000': 420
    },
    // Distance: 301-500 km
    '301-500': {
        '0-500': 65,
        '500-1000': 90,
        '1000-2000': 120,
        '2000-5000': 190,
        '5000-10000': 290,
        '10000-20000': 480
    },
    // Distance: 501-700 km
    '501-700': {
        '0-500': 75,
        '500-1000': 100,
        '1000-2000': 140,
        '2000-5000': 220,
        '5000-10000': 340,
        '10000-20000': 560
    },
    // Distance: 701-1000 km
    '701-1000': {
        '0-500': 85,
        '500-1000': 115,
        '1000-2000': 160,
        '2000-5000': 250,
        '5000-10000': 380,
        '10000-20000': 650
    }
};

// Estimate weight based on pages (average book weight ~ 5 grams per page)
const estimateBookWeight = (pages) => {
    if (!pages) return 336 * 5; // Default 336 pages (The Silent Patient) if not specified
    return Math.max(pages * 5, 100); // Minimum 100g
};

// Get distance category from distance in km
const getDistanceCategory = (distance) => {
    if (distance <= 10) return '0-10';
    if (distance <= 50) return '11-50';
    if (distance <= 100) return '51-100';
    if (distance <= 200) return '101-200';
    if (distance <= 300) return '201-300';
    if (distance <= 500) return '301-500';
    if (distance <= 700) return '501-700';
    if (distance <= 1000) return '701-1000';
    return '701-1000'; // Default to highest category for distances > 1000km
};

// Get weight category from weight in grams
const getWeightCategory = (weight) => {
    if (weight <= 500) return '0-500';
    if (weight <= 1000) return '500-1000';
    if (weight <= 2000) return '1000-2000';
    if (weight <= 5000) return '2000-5000';
    if (weight <= 10000) return '5000-10000';
    return '10000-20000';
};

// Calculate shipping cost based on distance and weight
const calculateShippingCost = (distance, weight) => {
    const distanceCategory = getDistanceCategory(distance);
    const weightCategory = getWeightCategory(weight);
    
    const rate = SHIPPING_RATES[distanceCategory][weightCategory];
    return rate || 650; // Default to highest rate if not found
};

// Geocode address using OpenStreetMap Nominatim API (free)
const geocodeAddress = async (address) => {
    try {
        // Format address for better geocoding results in India
        const queryString = `${address.pincode}, ${address.city}, ${address.state}, India`;
        console.log('Geocoding address:', queryString);
        
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: queryString,
                format: 'json',
                limit: 1,
                countrycodes: 'in' // Restrict to India
            },
            headers: {
                'User-Agent': 'SriCholaBookShop/1.0'
            }
        });
        
        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            console.log('Geocoding result:', {
                display_name: result.display_name,
                lat: result.lat,
                lon: result.lon
            });
            return {
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon)
            };
        }
        console.log('No geocoding results found for:', queryString);
        return null;
    } catch (error) {
        console.error('Geocoding error for address', address, ':', error.message);
        return null;
    }
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Main function to calculate shipping for an order
const calculateOrderShipping = async (shippingAddress, orderItems) => {
    try {
        console.log('=== Shipping Calculation Started ===');
        console.log('Shipping address:', shippingAddress);
        console.log('Order items:', orderItems);

        // Calculate total weight of order
        const totalWeight = orderItems.reduce((sum, item) => {
            const bookWeight = estimateBookWeight(item.pages || 300); // Default 300 pages if not specified
            console.log(`Book: ${item.title || 'Unknown'}, Pages: ${item.pages || 300}, Weight: ${bookWeight}g, Qty: ${item.qty}`);
            return sum + (bookWeight * item.qty);
        }, 0);

        console.log('Total order weight:', totalWeight, 'grams');

        // Geocode shop address (cached or static)
        console.log('Geocoding shop address...');
        const shopCoords = await geocodeAddress(SHOP_ADDRESS);
        if (!shopCoords) {
            throw new Error('Unable to geocode shop address');
        }
        console.log('Shop coordinates:', shopCoords);

        // Geocode delivery address
        console.log('Geocoding delivery address...');
        const deliveryCoords = await geocodeAddress(shippingAddress);
        if (!deliveryCoords) {
            throw new Error('Unable to geocode delivery address');
        }
        console.log('Delivery coordinates:', deliveryCoords);

        // Calculate distance
        const distance = calculateDistance(shopCoords, deliveryCoords);
        console.log('Calculated distance:', distance, 'km');

        // Calculate shipping cost
        const shippingCost = calculateShippingCost(distance, totalWeight);
        console.log('Shipping cost:', shippingCost);

        const result = {
            distance,
            totalWeight,
            shippingCost,
            distanceCategory: getDistanceCategory(distance),
            weightCategory: getWeightCategory(totalWeight)
        };

        console.log('Final shipping result:', result);
        console.log('=== Shipping Calculation Completed ===');
        return result;
    } catch (error) {
        console.error('Shipping calculation error:', error);
        // Return default shipping cost if calculation fails
        return {
            distance: 0,
            totalWeight: orderItems.reduce((sum, item) => sum + (estimateBookWeight(item.pages || 300) * item.qty), 0),
            shippingCost: 50, // Default shipping cost
            error: error.message
        };
    }
};

// Simple distance calculation based on pincode differences (fallback)
const calculateDistanceByPincode = (fromPincode, toPincode) => {
    // Special handling for Erode district pincodes (638xxx series)
    const erodeDistrictDistances = {
        // Shop location: 638453 (Gobichettipalayam)
        '638453': {
            '638453': 0,    // Same location (Gobichettipalayam)
            '638056': 25,   // Erode city (Periya Kattu street area)
            '638002': 30,   // Erode junction
            '638005': 35,   // Perundurai
            '638501': 15,   // Sathy main road area
            '638502': 20,   // Near Gobichettipalayam
            '638112': 40,   // Bhavani
            '638107': 45,   // Anthiyur
            '638183': 50,   // Nasiyanur
            '638311': 35,   // Chennimalai
            '638474': 18,   // Kavindapadi
            '638104': 32,   // Ammapet
            '638009': 28,   // Surampatti
            '638011': 26,   // Veerappanchatram
            '638012': 27,   // Pallipalayam
            '638504': 22,   // Sathiyamangalam
            '638115': 42,   // Gobi
        }
    };

    // Check if we have specific distance data for this route
    if (erodeDistrictDistances[fromPincode] && erodeDistrictDistances[fromPincode][toPincode]) {
        return erodeDistrictDistances[fromPincode][toPincode];
    }
    
    // Check reverse direction as well
    if (erodeDistrictDistances[toPincode] && erodeDistrictDistances[toPincode][fromPincode]) {
        return erodeDistrictDistances[toPincode][fromPincode];
    }

    // Fallback to general pincode logic
    const pincodeDistanceMap = {
        // Same pincode = 0-10km
        'same': 5,
        // Same city but different pincode = 11-50km
        'sameCity': 25,
        // Same state but different city = 51-200km
        'sameState': 125,
        // Different state = 201-500km
        'differentState': 350,
        // Very far = 500+km
        'veryFar': 750
    };

    // Extract first 2 digits for state, first 3 digits for region
    const fromState = fromPincode.substring(0, 2);
    const toState = toPincode.substring(0, 2);
    const fromRegion = fromPincode.substring(0, 3);
    const toRegion = toPincode.substring(0, 3);

    if (fromPincode === toPincode) return pincodeDistanceMap.same;
    if (fromRegion === toRegion) return pincodeDistanceMap.sameCity;
    if (fromState === toState) return pincodeDistanceMap.sameState;
    return pincodeDistanceMap.differentState;
};

// Fallback shipping calculation using pincode-based distance estimation
const calculateOrderShippingFallback = (shippingAddress, orderItems) => {
    const totalWeight = orderItems.reduce((sum, item) => {
        const bookWeight = estimateBookWeight(item.pages || 300);
        return sum + (bookWeight * item.qty);
    }, 0);

    const distance = calculateDistanceByPincode(SHOP_ADDRESS.pincode, shippingAddress.postalCode);
    const shippingCost = calculateShippingCost(distance, totalWeight);

    return {
        distance,
        totalWeight,
        shippingCost,
        distanceCategory: getDistanceCategory(distance),
        weightCategory: getWeightCategory(totalWeight),
        fallback: true
    };
};

export {
    calculateOrderShipping,
    calculateOrderShippingFallback,
    calculateShippingCost,
    estimateBookWeight,
    SHOP_ADDRESS,
    SHIPPING_RATES
};
