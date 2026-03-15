import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();

const destroyData = async () => {
    try {
        await connectDB();

        console.log('Connecting to database specifically to clear the books collection...');

        // Delete all books
        const result = await Book.deleteMany();

        console.log(`Successfully deleted ${result.deletedCount} books from the database!`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

destroyData();
