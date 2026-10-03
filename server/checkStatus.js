import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();

const checkStatus = async () => {
    try {
        await connectDB();

        // 1. Check Offers
        const booksWithOffers = await Book.find({ originalPrice: { $exists: true, $ne: null } });
        console.log(`Books with originalPrice set: ${booksWithOffers.length}`);
        if (booksWithOffers.length > 0) {
            console.log(`Example: ${booksWithOffers[0].title} - Price: ${booksWithOffers[0].price}, Original: ${booksWithOffers[0].originalPrice}`);
        }

        // 2. Check Cover Images
        const books = await Book.find({});
        console.log(`Total books: ${books.length}`);

        let placeholders = 0;
        let localUploads = 0;
        let amazonUrl = 0;
        let googleOlUrl = 0;

        books.forEach(b => {
            const img = b.coverImage || '';
            if (img.includes('placehold.co') || img.includes('sample.jpg') || img === '') {
                placeholders++;
                console.log(`[Placeholder] ${b.title} -> ${img}`);
            } else if (img.startsWith('/uploads/')) {
                localUploads++;
            } else if (img.includes('amazon')) {
                amazonUrl++;
                console.log(`[Amazon URL] ${b.title} -> ${img}`);
            } else {
                googleOlUrl++;
                console.log(`[Other URL] ${b.title} -> ${img}`);
            }
        });

        console.log(`\nSummary:`);
        console.log(`Placeholders: ${placeholders}`);
        console.log(`Local Uploads: ${localUploads}`);
        console.log(`Amazon URLs: ${amazonUrl}`);
        console.log(`Other URLs: ${googleOlUrl}`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkStatus();
