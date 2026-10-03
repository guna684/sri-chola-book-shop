import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkExpiredOrders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const now = new Date();
        const expired = await Order.find({
            status: { $in: ['Cancellation Pending', 'Cancelled'] },
            cancellationChargeStatus: 'Pending',
            cancellationDueDate: { $lt: now },
        });

        console.log(`Found ${expired.length} orders that should be expired but aren't yet.`);
        for (const order of expired) {
            console.log(`- Order ${order._id}: Status=${order.status}, Due=${order.cancellationDueDate?.toISOString()}`);
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkExpiredOrders();
