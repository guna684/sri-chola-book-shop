import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();
        
        console.log('Total users:', users.length);
        users.forEach(user => {
            console.log(`Email: ${user.email}, Name: ${user.name}, Admin: ${user.isAdmin}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
