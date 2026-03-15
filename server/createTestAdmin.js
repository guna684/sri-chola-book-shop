import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const createTestAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        
        // Create a simple admin user with plain text password for testing
        await db.collection('users').deleteOne({ email: 'test@admin.com' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('test123', salt);
        
        await db.collection('users').insertOne({
            name: 'Test Admin',
            email: 'test@admin.com',
            password: hashedPassword,
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        console.log('Test admin created:');
        console.log('Email: test@admin.com');
        console.log('Password: test123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestAdmin();
