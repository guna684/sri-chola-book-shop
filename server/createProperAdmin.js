import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createProperAdmin = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Delete any existing admin to avoid conflicts
        await User.deleteOne({ email: 'admin@sricholabooks.com' });

        // Create admin with plain text password (model will hash it automatically)
        const admin = new User({
            name: 'Sri Chola Books Admin',
            email: 'admin@sricholabooks.com',
            password: 'admin123', // Plain text - model will hash this
            isAdmin: true,
        });

        await admin.save();
        
        console.log('\n🎉 PROPER ADMIN ACCOUNT CREATED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@sricholabooks.com');
        console.log('🔑 Password: admin123');
        console.log('🌐 Admin Login: http://localhost:8080/admin-login');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createProperAdmin();
