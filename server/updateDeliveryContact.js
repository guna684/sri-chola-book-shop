import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

const updateDeliveryContact = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Find orders that match the address pattern
        const addressPattern = 'Kuthirai Vandi Theru, Seethalakshmi Puram, Gobichettipalayam';
        const postalCode = '638476';
        
        // Find orders with this address or postal code
        const orders = await Order.find({
            $or: [
                { 'shippingAddress.address': { $regex: addressPattern, $options: 'i' } },
                { 'shippingAddress.postalCode': postalCode }
            ]
        });

        console.log(`📦 Found ${orders.length} order(s) matching the address`);

        if (orders.length === 0) {
            console.log('❌ No orders found with this address. Let me check recent orders...');
            
            // Show recent orders to help identify the correct one
            const recentOrders = await Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('_id shippingAddress user createdAt');
            
            console.log('\n📋 Recent Orders:');
            recentOrders.forEach(order => {
                console.log(`ID: ${order._id.toString().slice(-8)}`);
                console.log(`Address: ${order.shippingAddress.address}`);
                console.log(`City: ${order.shippingAddress.city}, Pin: ${order.shippingAddress.postalCode}`);
                console.log(`Customer: ${order.user?.name || 'N/A'}`);
                console.log('---');
            });
        } else {
            // Update each matching order
            for (const order of orders) {
                console.log(`\n🔄 Updating Order: ${order._id.toString().slice(-8)}`);
                console.log(`Current Address: ${order.shippingAddress.address}`);
                console.log(`Current Contact: ${order.shippingAddress.deliveryContactNumber || 'Not set'}`);

                // Update the delivery contact number
                order.shippingAddress.deliveryContactNumber = '+91 9486762192';
                
                await order.save();
                
                console.log('✅ Updated with delivery contact: +91 9486762192');
            }
        }

        console.log('\n📧 Contact Information Summary:');
        console.log('📍 Address: Kuthirai Vandi Theru, Seethalakshmi Puram, Gobichettipalayam-638476, Tamil Nadu');
        console.log('📞 Mobile: +91 9486762192');
        console.log('📧 Email: sricholabookgob@gmail.com');

        await mongoose.connection.close();
        console.log('📊 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

updateDeliveryContact();
