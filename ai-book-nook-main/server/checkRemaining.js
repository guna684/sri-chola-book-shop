import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();

const check = async () => {
    await connectDB();
    const remaining = await Book.find({ coverImage: { $regex: 'media-amazon.com|placehold.co' } });
    console.log(remaining.length + ' remaining:');
    remaining.forEach(b => console.log('  - ' + b.title));
    process.exit();
};

check();
