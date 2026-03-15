import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const createNewAdmin = async () => {
    try {
        // Test database connection first
        console.log('🔄 Connecting to MongoDB...');
        console.log('📍 URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
        
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'administrator@sricholabooks.com' });
        if (existingAdmin) {
            console.log('⚠️ Admin account already exists. Updating password...');
            
            // Update existing admin password
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash('Admin@2024!Secure', salt);
            
            await User.updateOne(
                { email: 'administrator@sricholabooks.com' },
                { 
                    password: hashedPassword,
                    isAdmin: true,
                    updatedAt: new Date()
                }
            );
            
            console.log('✅ Admin password updated successfully');
        } else {
            // Create new admin user
            console.log('👤 Creating new admin user...');
            
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash('Admin@2024!Secure', salt);

            const newAdmin = new User({
                name: 'Sri Chola Books Administrator',
                email: 'administrator@sricholabooks.com',
                password: hashedPassword,
                isAdmin: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await newAdmin.save();
            console.log('✅ New admin user created successfully');
        }

        // Verify the admin account
        const verifyAdmin = await User.findOne({ email: 'administrator@sricholabooks.com' });
        if (verifyAdmin && verifyAdmin.isAdmin) {
            console.log('\n🎉 ADMIN ACCOUNT READY FOR USE');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email: administrator@sricholabooks.com');
            console.log('🔑 Password: Admin@2024!Secure');
            console.log('🌐 Admin Login: http://localhost:8080/admin-login');
            console.log('📦 Delivery Pricing: http://localhost:8080/admin/delivery-pricing');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } else {
            console.log('❌ Failed to verify admin account');
        }

        // Close database connection
        await mongoose.connection.close();
        console.log('📊 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('📊 Database connection closed via SIGINT');
    }
    process.exit(0);
});

createNewAdmin();
