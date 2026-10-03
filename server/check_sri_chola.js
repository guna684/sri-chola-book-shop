import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const run = async () => {
    await connectDB();
    const books = await Book.find({ title: { $regex: 'Sri Chola Book Shop', $options: 'i' } });
    
    let out = `Found ${books.length} books with Sri Chola Book Shop in title:\n`;
    for (const book of books) {
        out += `Title: ${book.title}\n`;
        out += `Cover: ${book.coverImage}\n`;
        out += '---\n';
    }
    fs.writeFileSync('check_sri_chola.txt', out);
    console.log('Done checking Sri Chola');
    process.exit(0);
};

run();
