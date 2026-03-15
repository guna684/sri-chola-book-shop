import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import fs from 'fs';

dotenv.config();

const getCovers = async () => {
    try {
        await connectDB();
        const books = await Book.find({ category: 'Tamil Literature' });
        const list = books.map(b => ({ title: b.title, cover: b.coverImage }));
        fs.writeFileSync('covers.json', JSON.stringify(list, null, 2), 'utf-8');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

getCovers();
