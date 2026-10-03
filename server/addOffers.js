import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();

const addOffers = async () => {
    try {
        await connectDB();

        const books = await Book.find({});
        console.log(`Adding offers to ${books.length} books...`);

        let updated = 0;
        for (const book of books) {
            // Calculate a realistic original price for good discount display
            // Discounts will range from 30% to 65%
            const discountPct = Math.floor(Math.random() * (65 - 30 + 1)) + 30;
            const originalPrice = Math.round(book.price / (1 - discountPct / 100) / 10) * 10; // round to nearest 10

            book.originalPrice = originalPrice;

            // Mark some popular books as featured/bestseller for offer section
            const popularTitles = [
                "Atomic Habits", "The Alchemist", "Sapiens: A Brief History of Humankind",
                "A Brief History of Time", "Wings of Fire", "Think and Grow Rich",
                "Rich Dad Poor Dad", "The Power of Now", "Ikigai", "Deep Work",
                "The Psychology of Money", "Can't Hurt Me", "Zero to One", "Cosmos",
                "The Selfish Gene", "Homo Deus", "Becoming", "Elon Musk", "Steve Jobs",
                "Outliers", "The 7 Habits of Highly Effective People"
            ];

            if (popularTitles.includes(book.title)) {
                book.featured = true;
                book.bestseller = true;
            }

            await book.save();
            updated++;
        }

        console.log(`✅ Successfully added originalPrice (offer pricing) to ${updated} books.`);
        process.exit(0);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

addOffers();
