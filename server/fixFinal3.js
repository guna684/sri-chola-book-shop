import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import Book from './models/Book.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Reliable Open Library cover IDs for the 3 remaining books
const fixes = [
    { title: 'Parallel Worlds', coverUrl: 'https://covers.openlibrary.org/b/id/8091016-L.jpg' },
    { title: 'The Universe in a Nutshell', coverUrl: 'https://covers.openlibrary.org/b/id/6720424-L.jpg' },
    { title: 'Maximum Achievement', coverUrl: 'https://covers.openlibrary.org/b/id/9254595-L.jpg' },
];

const fix = async () => {
    await connectDB();
    const uploadsDir = path.join(__dirname, 'uploads', 'book-covers');

    for (const f of fixes) {
        const book = await Book.findOne({ title: f.title });
        if (!book) { console.log('Not found: ' + f.title); continue; }

        try {
            const resp = await axios({ url: f.coverUrl, method: 'GET', responseType: 'stream', timeout: 15000 });
            const fileName = `book_fix_${book._id}.jpg`;
            const filePath = path.join(uploadsDir, fileName);
            const writer = fs.createWriteStream(filePath);
            resp.data.pipe(writer);
            await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });

            book.coverImage = `/uploads/book-covers/${fileName}`;
            book.image_url = book.coverImage;
            await book.save();
            console.log('✅ Fixed: ' + f.title);
        } catch (e) {
            console.log('❌ Failed: ' + f.title + ' - ' + e.message);
        }
    }

    console.log('Done.');
    process.exit(0);
};
fix();
