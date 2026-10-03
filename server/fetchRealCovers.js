import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchRealCovers = async () => {
    try {
        await connectDB();

        console.log('Fetching Tamil Literature books with placeholder covers...');
        const books = await Book.find({
            category: 'Tamil Literature',
            coverImage: /placehold\.co/i
        });

        console.log(`Found ${books.length} books. Fetching real covers from public APIs...`);
        let updatedCount = 0;

        const uploadsDir = path.join(__dirname, '..', 'uploads', 'book-covers');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        for (const book of books) {
            console.log(`Searching for: ${book.title}`);
            try {
                // Try Google Books API first
                const query = encodeURIComponent(`${book.title}`);
                const gbRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3`);

                let coverUrl = null;

                if (gbRes.data.items && gbRes.data.items.length > 0) {
                    for (const item of gbRes.data.items) {
                        const volumeInfo = item.volumeInfo;
                        if (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) {
                            coverUrl = volumeInfo.imageLinks.thumbnail.replace('http:', 'https:').replace('&edge=curl', '');
                            coverUrl = coverUrl.replace('zoom=1', 'zoom=3'); // get larger if possible
                            break;
                        }
                    }
                }

                // If not found in Google Books, try OpenLibrary
                if (!coverUrl) {
                    const olRes = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
                    const docs = olRes.data.docs;
                    const docWithCover = docs.find(doc => doc.cover_i);

                    if (docWithCover) {
                        coverUrl = `https://covers.openlibrary.org/b/id/${docWithCover.cover_i}-L.jpg`;
                    }
                }

                // If STILL not found, use Antigravity API
                if (!coverUrl) {
                    console.log(`No real cover found for ${book.title}. Generating with Antigravity...`);
                    const apiUrl = process.env.ANTIGRAVITY_API_URL || 'https://api.antigravity.ai/generate-image';
                    const genreStr = book.genre || book.category || 'general';
                    const prompt = `Professional, epic, gorgeous book cover for ${book.title} by ${book.author}, genre ${genreStr}`;

                    try {
                        const response = await axios.post(apiUrl, {
                            prompt,
                            size: '1024x1024'
                        });
                        coverUrl = response.data.image_url;
                    } catch (apiError) {
                        console.log('Antigravity API failed.');
                    }
                }

                if (coverUrl) {
                    if (coverUrl.includes('books.google') || coverUrl.includes('openlibrary') || coverUrl.includes('antigravity')) {
                        // Download and save locally for consistency
                        try {
                            const imageResponse = await axios({
                                url: coverUrl,
                                method: 'GET',
                                responseType: 'stream'
                            });

                            const extension = coverUrl.split('.').pop().split('?')[0] || 'jpg';
                            const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(extension.toLowerCase()) ? extension : 'jpg';
                            const fileName = `${book._id}_real.${ext}`;
                            const filePath = path.join(uploadsDir, fileName);

                            const writer = fs.createWriteStream(filePath);
                            imageResponse.data.pipe(writer);

                            await new Promise((resolve, reject) => {
                                writer.on('finish', resolve);
                                writer.on('error', reject);
                            });

                            book.coverImage = `/uploads/book-covers/${fileName}`;
                            book.image_url = `/uploads/book-covers/${fileName}`;
                        } catch (e) {
                            console.log('Failed to download image. Using direct URL.');
                            book.coverImage = coverUrl;
                            book.image_url = coverUrl;
                        }
                    } else {
                        book.coverImage = coverUrl;
                        book.image_url = coverUrl;
                    }

                    await book.save();
                    updatedCount++;
                    console.log(`✅ Updated cover for ${book.title}`);
                } else {
                    console.log(`❌ Still no cover found for ${book.title}`);
                }

                // Be polite to APIs
                await sleep(1500);
            } catch (err) {
                console.error(`Error fetching cover for ${book.title}:`, err.message);
                await sleep(2000);
            }
        }

        console.log(`Successfully updated covers for ${updatedCount} additional books!`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating covers:', error);
        process.exit(1);
    }
};

fetchRealCovers();
