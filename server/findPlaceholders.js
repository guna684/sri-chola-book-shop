import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();

const findPlaceholders = async () => {
    try {
        await connectDB();

        const books = await Book.find({ coverImage: { $regex: 'placehold.co' } });
        console.log(`Found ${books.length} books with placeholder covers:`);
        books.forEach(b => console.log(`- ${b.title} by ${b.author}`));

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

findPlaceholders();
