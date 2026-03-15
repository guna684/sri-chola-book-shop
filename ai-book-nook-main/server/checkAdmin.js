import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkAdminUser = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Check for admin user
        const adminUser = await User.findOne({ email: 'admin@sricholabooks.com' });
        
        if (adminUser) {
            console.log('✅ Admin user found:');
            console.log('📧 Email:', adminUser.email);
            console.log('👤 Name:', adminUser.name);
            console.log('🔐 Is Admin:', adminUser.isAdmin);
            console.log('🆔 ID:', adminUser._id);
        } else {
            console.log('❌ Admin user not found');
            
            // Check if there are any admin users
            const admins = await User.find({ isAdmin: true });
            console.log('📊 Total admin users:', admins.length);
            
            if (admins.length > 0) {
                console.log('📋 Admin users found:');
                admins.forEach(admin => {
                    console.log(`  - Email: ${admin.email}, Name: ${admin.name}`);
                });
            } else {
                console.log('⚠️ No admin users found. Creating admin user...');
                
                // Create admin user
                const admin = await User.create({
                    name: 'Admin User',
                    email: 'admin@sricholabooks.com',
                    password: 'admin123',
                    isAdmin: true
                });
                
                console.log('✅ Admin user created:');
                console.log('📧 Email:', admin.email);
                console.log('👤 Name:', admin.name);
                console.log('🔐 Is Admin:', admin.isAdmin);
                console.log('🔑 Password: admin123');
            }
        }

        await mongoose.connection.close();
        console.log('📊 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkAdminUser();
