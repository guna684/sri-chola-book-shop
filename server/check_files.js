import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const run = async () => {
    await connectDB();
    const books = await Book.find({ title: { $in: ["Wings of Fire | Sri Chola Book Shop", "Wings of Fire", "The Diary of a Young Girl | Sri Chola Book Shop", "The Diary of a Young Girl", "Long Walk to Freedom", "Long Walk to Freedom | Sri Chola Book Shop"] } });
    
    for (const book of books) {
        console.log(`Title: ${book.title}`);
        console.log(`Cover: ${book.coverImage}`);
        
        if (book.coverImage && book.coverImage.startsWith('/uploads/')) {
            // Check if file exists
            const filepath = path.join(process.cwd(), book.coverImage);
            const exists = fs.existsSync(filepath);
            console.log(`File exists on disk: ${exists}`);
        } else {
            console.log(`Not a local upload path.`);
        }
        console.log('---');
    }
    process.exit(0);
};

run();
