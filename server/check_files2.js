import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const run = async () => {
    await connectDB();
    const books = await Book.find({ title: { $regex: 'Wings of Fire|The Diary of a Young Girl|Long Walk to Freedom' } });
    
    let out = '';
    for (const book of books) {
        out += `Title: ${book.title}\n`;
        out += `Cover: ${book.coverImage}\n`;
        
        if (book.coverImage && book.coverImage.startsWith('/uploads/')) {
            const filepath = path.join(process.cwd(), book.coverImage);
            const exists = fs.existsSync(filepath);
            out += `File exists on disk: ${exists}\n`;
        } else {
            out += `Not a local upload path.\n`;
        }
        out += '---\n';
    }
    fs.writeFileSync('check_out.txt', out);
    console.log('Done');
    process.exit(0);
};

run();
