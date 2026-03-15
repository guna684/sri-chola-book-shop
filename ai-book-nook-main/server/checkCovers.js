import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();

const checkCovers = async () => {
    try {
        await connectDB();
        const books = await Book.find({ category: 'Tamil Literature' });

        console.log(`Checking ${books.length} books...`);
        let count = 1;
        for (const book of books) {
            console.log(`${count}. [${book.title}]: ${book.coverImage}`);
            count++;
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCovers();
