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

const downloadAndFix = async () => {
    try {
        await connectDB();

        const uploadsDir = path.join(__dirname, 'uploads', 'book-covers');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Step 1 - Remove ALL offers from ALL books
        console.log('Removing all offer prices...');
        await Book.updateMany({}, { $unset: { originalPrice: 1 } });
        console.log('✅ All original prices removed (no offers).');

        // Step 2 - Download all Amazon covers locally
        const books = await Book.find({ coverImage: { $regex: '^https://m.media-amazon.com' } });
        console.log(`\nDownloading ${books.length} Amazon covers locally...`);

        let downloaded = 0;
        let failed = 0;

        for (const book of books) {
            try {
                const imageUrl = book.coverImage;
                const fileName = `book_${book._id}.jpg`;
                const filePath = path.join(uploadsDir, fileName);

                const resp = await axios({
                    url: imageUrl,
                    method: 'GET',
                    responseType: 'stream',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
                        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                        'Referer': 'https://www.amazon.com/'
                    },
                    timeout: 15000
                });

                const writer = fs.createWriteStream(filePath);
                resp.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // Verify image downloaded correctly (should be > 10KB)
                const stat = fs.statSync(filePath);
                if (stat.size < 5000) {
                    fs.unlinkSync(filePath);
                    console.log(`  ⚠️  Small file, keeping Amazon URL for: ${book.title}`);
                    failed++;
                    continue;
                }

                book.coverImage = `/uploads/book-covers/${fileName}`;
                book.image_url = book.coverImage;
                await book.save();
                downloaded++;

                if (downloaded % 10 === 0) {
                    console.log(`  Progress: ${downloaded} downloaded...`);
                }
            } catch (e) {
                console.log(`  ❌ Failed ${book.title}: ${e.message}`);
                failed++;
            }

            await sleep(200); // gentle throttle
        }

        console.log(`\n✅ Done! Downloaded: ${downloaded}, Failed: ${failed}`);

        // Step 3 - Fix any remaining placeholder books using OpenLibrary
        const placeholders = await Book.find({
            $or: [
                { coverImage: { $regex: 'placehold.co' } },
                { coverImage: null },
                { coverImage: '' }
            ]
        });

        if (placeholders.length > 0) {
            console.log(`\nFetching OpenLibrary covers for ${placeholders.length} remaining books...`);
            for (const book of placeholders) {
                try {
                    const query = encodeURIComponent(book.title);
                    const res = await axios.get(`https://openlibrary.org/search.json?title=${query}&limit=1`);
                    if (res.data.docs && res.data.docs[0]?.cover_i) {
                        const coverUrl = `https://covers.openlibrary.org/b/id/${res.data.docs[0].cover_i}-L.jpg`;
                        const resp = await axios({ url: coverUrl, method: 'GET', responseType: 'stream', timeout: 15000 });

                        const fileName = `book_ol_${book._id}.jpg`;
                        const filePath = path.join(uploadsDir, fileName);
                        const writer = fs.createWriteStream(filePath);
                        resp.data.pipe(writer);
                        await new Promise((resolve, reject) => {
                            writer.on('finish', resolve);
                            writer.on('error', reject);
                        });

                        book.coverImage = `/uploads/book-covers/${fileName}`;
                        book.image_url = book.coverImage;
                        await book.save();
                        console.log(`  ✅ Fixed via OpenLibrary: ${book.title}`);
                    }
                } catch (e) {
                    console.log(`  ⚠️  Could not fix: ${book.title}`);
                }
                await sleep(500);
            }
        }

        console.log('\n🚀 All done!');
        process.exit(0);
    } catch (err) {
        console.error(`Error:`, err.message);
        process.exit(1);
    }
};

downloadAndFix();
