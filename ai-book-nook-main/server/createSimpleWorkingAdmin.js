import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createSimpleWorkingAdmin = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Delete any existing simple admin
        await User.deleteOne({ email: 'admin@srichola.com' });

        // Create simple admin with basic password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new User({
            name: 'Sri Chola Admin',
            email: 'admin@srichola.com',
            password: hashedPassword,
            isAdmin: true,
        });

        await admin.save();
        
        console.log('\n🎉 NEW ADMIN ACCOUNT CREATED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@srichola.com');
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

createSimpleWorkingAdmin();
