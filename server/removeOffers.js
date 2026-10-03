import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();
connectDB();

const removeOffers = async () => {
    try {
        const books = await Book.find({});
        console.log(`Found ${books.length} books. Setting offers to 0...`);

        let updatedCount = 0;

        for (const book of books) {
            // If the originalPrice is greater than price, there is an offer.
            // By setting originalPrice to the current price (or null), the offer becomes 0.
            if (book.originalPrice && book.originalPrice !== book.price) {
                book.originalPrice = book.price;
                await book.save();
                updatedCount++;
            }
        }

        console.log(`Successfully removed offers (set originalPrice = price) for ${updatedCount} books.`);
        process.exit(0);
    } catch (error) {
        console.error('Error removing offers:', error);
        process.exit(1);
    }
};

removeOffers();
