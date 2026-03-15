import connectDB from './config/db.js';
import Book from './models/Book.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await connectDB();
    const result = await Book.updateMany({}, { $set: { rating: 0, reviewCount: 0, reviews: [] } });
    console.log(`Updated ${result.modifiedCount} books — reviews set to zero.`);
    process.exit(0);
};
run();
