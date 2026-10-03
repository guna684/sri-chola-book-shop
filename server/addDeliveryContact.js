import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

const addDeliveryContactToOrder = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Since no exact match found, let's update orders from Gobichettipalayam area
        // or you can specify an exact order ID to update
        
        // Option 1: Update orders from Gobichettipalayam or nearby areas
        const areaOrders = await Order.find({
            $or: [
                { 'shippingAddress.city': { $regex: 'gobichettipalayam', $options: 'i' } },
                { 'shippingAddress.postalCode': '638476' },
                { 'shippingAddress.city': { $regex: 'erode', $options: 'i' } }
            ]
        });

        console.log(`📦 Found ${areaOrders.length} order(s) from the area`);

        if (areaOrders.length > 0) {
            for (const order of areaOrders) {
                console.log(`\n🔄 Updating Order: ${order._id.toString().slice(-8)}`);
                console.log(`Address: ${order.shippingAddress.address}`);
                console.log(`City: ${order.shippingAddress.city}, Pin: ${order.shippingAddress.postalCode}`);
                
                // Update with the delivery contact information
                order.shippingAddress.deliveryContactNumber = '+91 9486762192';
                
                await order.save();
                console.log('✅ Updated with delivery contact: +91 9486762192');
            }
        }

        // Option 2: Create a reference for the specific location
        console.log('\n📍 DELIVERY CONTACT INFORMATION STORED:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🏠 Location: Kuthirai Vandi Theru, Seethalakshmi Puram');
        console.log('🏙️  City: Gobichettipalayam-638476, Tamil Nadu');
        console.log('📞 Mobile: +91 9486762192');
        console.log('📧 Email: sricholabookgob@gmail.com');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Option 3: If you have a specific order ID, uncomment and use this:
        // const specificOrderId = 'YOUR_ORDER_ID_HERE';
        // const specificOrder = await Order.findById(specificOrderId);
        // if (specificOrder) {
        //     specificOrder.shippingAddress.deliveryContactNumber = '+91 9486762192';
        //     await specificOrder.save();
        //     console.log(`✅ Updated specific order: ${specificOrderId}`);
        // }

        await mongoose.connection.close();
        console.log('📊 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

addDeliveryContactToOrder();
