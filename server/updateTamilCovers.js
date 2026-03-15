import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();

const updateTamilCovers = async () => {
    try {
        await connectDB();

        console.log('Fetching Tamil Literature books...');
        const books = await Book.find({ category: 'Tamil Literature' });

        console.log(`Found ${books.length} books. Updating covers...`);
        let updatedCount = 0;

        for (const book of books) {
            // Encode the title for the placeholder URL
            const text = encodeURIComponent(book.title);
            // generate a beautiful dynamic cover
            const coverUrl = `https://placehold.co/600x900/1e293b/f8fafc.png?text=${text}`;

            book.coverImage = coverUrl;
            book.image_url = coverUrl;

            await book.save();
            updatedCount++;
        }

        console.log(`Successfully updated covers for ${updatedCount} books!`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating covers:', error);
        process.exit(1);
    }
};

updateTamilCovers();
