import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

dotenv.config();

const run = async () => {
    await connectDB();
    const books = await Book.find({});
    
    let badCovers = [];

    // Analyze sizes of local "placeholders"
    // The placeholder image is likely the same exact size.
    let countEmpty = 0;
    
    for (const book of books) {
        if (!book.coverImage || book.coverImage.trim() === '') {
            badCovers.push({ title: book.title, reason: 'Empty coverImage' });
            continue;
        }

        if (book.coverImage.startsWith('/uploads/')) {
            const filepath = path.join(process.cwd(), book.coverImage);
            if (fs.existsSync(filepath)) {
                const stat = fs.statSync(filepath);
                // "Image not available" typically has a specific small size, let's identify anything < 15KB as suspicious and flag it for review
                if (stat.size < 10000) { 
                    badCovers.push({ title: book.title, reason: `Suspicious local file size (${stat.size} bytes)`});
                }
            } else {
                badCovers.push({ title: book.title, reason: 'Local file missing' });
            }
        } else if (book.coverImage.includes('amazon')) {
             try {
                 const res = await axios.head(book.coverImage, { headers: { "User-Agent": "Mozilla/5.0" }, validateStatus: () => true });
                 if (res.status >= 400) {
                     badCovers.push({ title: book.title, reason: `Amazon URL 404 (${res.status})` });
                 }
             } catch(e) {
                 badCovers.push({ title: book.title, reason: `Amazon URL err (${e.message})` });
             }
        }
    }
    
    console.log("Books needing cover replacement:", badCovers);
    if(badCovers.length > 0) {
        fs.writeFileSync('bad_covers.json', JSON.stringify(badCovers, null, 2));
    }
    process.exit(0);
};

run();
