import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js'; // Ensure path is correct relative to execution

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function runVerification() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Create a "Cancellation Pending" order (Simulation)
        const pendingOrder = await Order.create({
            user: new mongoose.Types.ObjectId(), // dummy
            orderItems: [],
            shippingAddress: { address: 'Test', city: 'Test', postalCode: '123', country: 'Test' },
            paymentMethod: 'COD',
            itemsPrice: 100,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: 100,
            status: 'Cancellation Pending',
            cancellationType: 'COD',
            cancellationCharge: 25,
            cancellationChargeStatus: 'Pending',
            cancellationDueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
            cancellationRequestedAt: new Date()
        });
        console.log('✅ Created Cancellation Pending order:', pendingOrder._id);

        // 2. Create an "Expired" order (Simulation)
        const expiredOrder = await Order.create({
            user: new mongoose.Types.ObjectId(), // dummy
            orderItems: [],
            shippingAddress: { address: 'Test', city: 'Test', postalCode: '123', country: 'Test' },
            paymentMethod: 'COD',
            itemsPrice: 100,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: 100,
            status: 'Processing',
            cancellationType: 'COD',
            cancellationCharge: 25,
            cancellationChargeStatus: 'Expired'
        });
        console.log('✅ Created Expired cancellation order:', expiredOrder._id);

        // 3. Clean up (Optional, or just keep them for user to see in UI)
        // For this task, I'll keep them so the user can verify in their browser.

        await mongoose.connection.close();
        console.log('✅ Verification setup complete. You can now check the Admin panel.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

runVerification();
