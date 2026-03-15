import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config({ path: './server/.env' });

const createFreshAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Delete existing admin
        await User.deleteOne({ email: 'admin@bookshop.com' });

        // Create new admin with simple password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password', salt);

        const admin = new User({
            name: 'Admin',
            email: 'admin@bookshop.com',
            password: hashedPassword,
            isAdmin: true,
        });

        await admin.save();
        console.log('New admin created:');
        console.log('Email: admin@bookshop.com');
        console.log('Password: password');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createFreshAdmin();
