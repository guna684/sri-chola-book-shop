import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkOrder(orderId) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const order = await Order.findById(orderId);
        if (!order) {
            console.log('❌ Order not found');
            return;
        }

        console.log('Order Details:');
        console.log('  ID:', order._id);
        console.log('  Status:', order.status);
        console.log('  Cancellation Type:', order.cancellationType);
        console.log('  Charge Status:', order.cancellationChargeStatus);
        console.log('  Due Date (ISO):', order.cancellationDueDate?.toISOString());
        console.log('  Current Time (ISO):', new Date().toISOString());
        console.log('  Is Expired (Due Date < Now):', order.cancellationDueDate < new Date());

        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

const id = '699fdbb6620c9770d7a07119';
checkOrder(id);
