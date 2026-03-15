import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const createSriCholaAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete any existing user with this email to avoid conflicts
        await mongoose.connection.db.collection('users').deleteOne({ email: 'admin@sricholabookshop.com' });

        // Create new admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin@sricholabookshop.com', salt);

        await mongoose.connection.db.collection('users').insertOne({
            name: 'Sri Chola Admin',
            email: 'admin@sricholabookshop.com',
            password: hashedPassword,
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('✅ Sri Chola Admin account created successfully!');
        console.log('📧 Email: admin@sricholabookshop.com');
        console.log('🔑 Password: admin@sricholabookshop.com');
        console.log('🌐 Admin Login URL: http://localhost:8080/admin-login');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createSriCholaAdmin();
