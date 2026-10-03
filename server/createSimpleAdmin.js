import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load .env from server directory
dotenv.config({ path: './server/.env' });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Delete any existing admin users to avoid conflicts
        await User.deleteMany({ isAdmin: true });

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new User({
            name: 'Book Shop Admin',
            email: 'admin@bookshop.com',
            password: hashedPassword,
            isAdmin: true,
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@bookshop.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
