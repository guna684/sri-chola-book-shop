import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Initializing environment variables
dotenv.config();


import { startCancellationScheduler } from './cancellationScheduler.js';

connectDB().then(() => {
    startCancellationScheduler();
}).catch((err) => {
    console.error('Failed to initialize database:', err.message);
});

const app = express();

const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is in the allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow any Vercel deployment
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/messages', messageRoutes);
import settingsRoutes from './routes/settingsRoutes.js';
app.use('/api/settings', settingsRoutes);
import newsletterRoutes from './routes/newsletterRoutes.js';
app.use('/api/newsletter', newsletterRoutes);
import offerRoutes from './routes/offerRoutes.js';
app.use('/api/offers', offerRoutes);
import categoryRoutes from './routes/categoryRoutes.js';
app.use('/api/categories', categoryRoutes);
import chatRoutes from './routes/chatRoutes.js';
app.use('/api/chat', chatRoutes);
import promoRoutes from './routes/promoRoutes.js';
app.use('/api/promo', promoRoutes);
import analyticsRoutes from './routes/analyticsRoutes.js';
app.use('/api/analytics', analyticsRoutes);
import bannerRoutes from './routes/bannerRoutes.js';
app.use('/api/banner', bannerRoutes);
import uploadRoutes from './routes/uploadRoutes.js';
app.use('/api/upload', uploadRoutes);
import quickLinksRoutes from './routes/quickLinksRoutes.js';
app.use('/api/admin', quickLinksRoutes);
import shippingRoutes from './routes/shippingRoutes.js';
app.use('/api/shipping', shippingRoutes);
import deliveryPriceRoutes from './routes/deliveryPriceRoutes.js';
app.use('/api/orders', deliveryPriceRoutes);




import { notFound, errorHandler } from './middleware/errorMiddleware.js';

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
