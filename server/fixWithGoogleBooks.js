import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import Book from './models/Book.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const downloadFile = async (url, dest, headers = {}) => {
    const resp = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers,
        timeout: 20000
    });
    const writer = fs.createWriteStream(dest);
    resp.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            // Check it downloaded properly
            const stat = fs.statSync(dest);
            if (stat.size < 3000) {
                fs.unlinkSync(dest);
                reject(new Error(`Too small: ${stat.size} bytes`));
            } else {
                resolve(true);
            }
        });
        writer.on('error', reject);
    });
};

const fixWithGoogleBooks = async () => {
    try {
        await connectDB();

        const uploadsDir = path.join(__dirname, 'uploads', 'book-covers');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Find books that still have Amazon URLs (failed download) or placeholder
        const books = await Book.find({
            $or: [
                { coverImage: { $regex: 'media-amazon.com' } },
                { coverImage: { $regex: 'placehold.co' } },
                { coverImage: null },
                { coverImage: '' }
            ]
        });

        console.log(`Found ${books.length} books needing cover fix...`);

        let fixed = 0;
        let failed = 0;

        for (const book of books) {
            try {
                // Try Google Books API first
                const query = encodeURIComponent(`intitle:"${book.title}" inauthor:"${book.author}"`);
                const gbRes = await axios.get(
                    `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3&orderBy=relevance`,
                    { timeout: 10000 }
                );

                let coverUrl = null;

                if (gbRes.data.items && gbRes.data.items.length > 0) {
                    for (const item of gbRes.data.items) {
                        const links = item.volumeInfo?.imageLinks;
                        if (links) {
                            // Get the highest quality version available
                            const raw = links.extraLarge || links.large || links.medium || links.thumbnail;
                            if (raw) {
                                coverUrl = raw
                                    .replace('http:', 'https:')
                                    .replace('&edge=curl', '')
                                    .replace('zoom=1', 'zoom=3');        // zoom=3 for better quality
                                break;
                            }
                        }
                    }
                }

                if (!coverUrl) {
                    // Fallback to OpenLibrary
                    const olQuery = encodeURIComponent(book.title);
                    const olRes = await axios.get(`https://openlibrary.org/search.json?title=${olQuery}&limit=1`, { timeout: 10000 });
                    if (olRes.data.docs?.[0]?.cover_i) {
                        coverUrl = `https://covers.openlibrary.org/b/id/${olRes.data.docs[0].cover_i}-L.jpg`;
                    }
                }

                if (!coverUrl) {
                    console.log(`  ⚠️  No cover source found for: ${book.title}`);
                    failed++;
                    continue;
                }

                const fileName = `book_gb_${book._id}_${Date.now()}.jpg`;
                const filePath = path.join(uploadsDir, fileName);

                await downloadFile(coverUrl, filePath);

                book.coverImage = `/uploads/book-covers/${fileName}`;
                book.image_url = book.coverImage;
                await book.save();
                fixed++;
                console.log(`  ✅ Fixed: ${book.title}`);

            } catch (e) {
                console.log(`  ❌ Failed: ${book.title} — ${e.message}`);
                failed++;
            }

            await sleep(500);
        }

        console.log(`\n🚀 Done! Fixed: ${fixed}, Failed: ${failed}`);

        const remaining = await Book.find({ coverImage: { $regex: 'media-amazon.com|placehold.co' } });
        if (remaining.length > 0) {
            console.log(`Remaining with external URLs: ${remaining.length}`);
            remaining.forEach(b => console.log(`  - ${b.title}`));
        }

        process.exit(0);
    } catch (err) {
        console.error(`Error:`, err.message);
        process.exit(1);
    }
};

fixWithGoogleBooks();
