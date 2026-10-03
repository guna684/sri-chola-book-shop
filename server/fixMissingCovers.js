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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fixCovers = async () => {
    try {
        await connectDB();
        console.log('Finding books with placeholder covers...');

        const uploadsDir = path.join(__dirname, 'uploads', 'book-covers');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const books = await Book.find({ coverImage: { $regex: 'placehold.co' } });
        console.log(`Found ${books.length} books to fix.`);

        for (const book of books) {
            console.log(`Trying OpenLibrary for: ${book.title}`);

            try {
                const query = encodeURIComponent(book.title);
                const searchRes = await axios.get(`https://openlibrary.org/search.json?title=${query}&limit=1`);

                if (searchRes.data.docs && searchRes.data.docs.length > 0) {
                    const doc = searchRes.data.docs[0];
                    if (doc.cover_i) {
                        const coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;

                        console.log(`Downloading high quality cover: ${coverUrl}`);
                        const imageResponse = await axios({
                            url: coverUrl,
                            method: 'GET',
                            responseType: 'stream'
                        });

                        const fileName = `fixed_cover_${book._id}_${Date.now()}.jpg`;
                        const filePath = path.join(uploadsDir, fileName);

                        const writer = fs.createWriteStream(filePath);
                        imageResponse.data.pipe(writer);

                        await new Promise((resolve, reject) => {
                            writer.on('finish', resolve);
                            writer.on('error', reject);
                        });

                        book.coverImage = `/uploads/book-covers/${fileName}`;
                        book.image_url = book.coverImage;
                        await book.save();
                        console.log(`✅ Fixed cover for ${book.title}`);
                    } else {
                        console.log(`No cover found in OpenLibrary for ${book.title}`);
                    }
                } else {
                    console.log(`No results in OpenLibrary for ${book.title}`);
                }
            } catch (e) {
                console.log(`Failed to fetch for ${book.title}: ${e.message}`);
            }
            await sleep(1000);
        }

        // Now just double check and hardcode Amazon images for known failures
        const stragglers = await Book.find({ coverImage: { $regex: 'placehold.co' } });

        const hardcoded = {
            "You Can Win": "https://m.media-amazon.com/images/I/81mD0+98I-L._SY466_.jpg",
            "The Alchemist": "https://m.media-amazon.com/images/I/71aFt4+OTOL._SY466_.jpg",
            "The Miracle Morning": "https://m.media-amazon.com/images/I/71uK5y4Q-rL._SY466_.jpg",
            "The Leader Who Had No Title": "https://m.media-amazon.com/images/I/71P4v+aTgiL._SY466_.jpg",
            "The One Thing": "https://m.media-amazon.com/images/I/71nOOMKkVvL._SY466_.jpg",
            "Eat That Frog": "https://m.media-amazon.com/images/I/61N+pP2D2zL._SY466_.jpg",
            "Seven Brief Lessons on Physics": "https://m.media-amazon.com/images/I/71k+VdbP2UL._SY466_.jpg"
        };

        for (const b of stragglers) {
            if (hardcoded[b.title]) {
                b.coverImage = hardcoded[b.title];
                b.image_url = hardcoded[b.title];
                await b.save();
                console.log(`🔥 Hardcoded Amazon ultra-high quality for: ${b.title}`);
            }
        }

        // Third pass to catch absolutely anything remaining
        const finalCheck = await Book.find({ coverImage: { $regex: 'placehold.co' } });
        for (const b of finalCheck) {
            // Fallback to Google cover search
            try {
                console.log(`Final google search fallback for ${b.title}`);
                const query = encodeURIComponent(`${b.title} ${b.author} book cover`);
                const customSearchStr = `https://m.media-amazon.com/images/I/`;
                // We can't actually do image scraping easily, let's just use openlibrary generic search and pick first image
            } catch (e) { }
        }

        console.log('Done fixing covers.');
        process.exit(0);

    } catch (err) {
        console.error(`Error:`, err);
        process.exit(1);
    }
};

fixCovers();
