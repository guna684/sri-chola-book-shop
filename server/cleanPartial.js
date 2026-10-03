import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();

const cleanPartial = async () => {
    try {
        await connectDB();
        await Book.deleteMany({});
        console.log('Cleared out partial inserts to start fresh.');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
cleanPartial();
