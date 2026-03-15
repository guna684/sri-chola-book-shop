import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    await connectDB();
    const books = await Book.find({ title: /Wings of Fire/i });
    console.log(JSON.stringify(books, null, 2));
    process.exit(0);
};

run();
