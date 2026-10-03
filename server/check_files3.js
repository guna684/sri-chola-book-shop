import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const run = async () => {
    await connectDB();
    const books = await Book.find({ title: { $regex: 'Wings of Fire|The Diary of a Young Girl|Long Walk to Freedom', $options: 'i' } });
    
    let out = '';
    for (const book of books) {
        out += `Title: ${book.title}\n`;
        out += `Cover: ${book.coverImage}\n`;
        out += '---\n';
    }
    fs.writeFileSync('check_out3.txt', out);
    console.log('Done');
    process.exit(0);
};

run();
