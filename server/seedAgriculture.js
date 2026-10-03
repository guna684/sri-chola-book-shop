import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import Book from './models/Book.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './server/.env' });
connectDB();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const agricultureBooks = [
    {
        title: "The Omnivore's Dilemma",
        author: "Michael Pollan",
        description: "A natural history of four meals. Pollan traces the origins of what we eat, from industrial farming to organic agriculture and foraging, challenging us to reconsider our relationship with food.",
        price: 499,
        category: "Agriculture",
        genre: "Food & Sustainability",
        stock: 45,
        isbn: "978-0143038580",
        pages: 450,
        language: "English",
        publishedDate: "2006-04-11",
        featured: true,
        bestseller: true
    },
    {
        title: "Silent Spring",
        author: "Rachel Carson",
        description: "The classic that launched the environmental movement. Carson documents the adverse environmental effects caused by the indiscriminate use of pesticides.",
        price: 399,
        category: "Agriculture",
        genre: "Environmental Science",
        stock: 60,
        isbn: "978-0618249060",
        pages: 400,
        language: "English",
        publishedDate: "1962-09-27",
        featured: true,
        bestseller: true
    },
    {
        title: "Teaming with Microbes",
        author: "Jeff Lowenfels",
        description: "The Organic Gardener's Guide to the Soil Food Web. A comprehensive guide to understanding and nurturing the complex soil ecosystem for healthier, more productive gardens and farms.",
        price: 550,
        category: "Agriculture",
        genre: "Soil Science",
        stock: 30,
        isbn: "978-1604691139",
        pages: 220,
        language: "English",
        publishedDate: "2010-02-24",
        featured: false,
        bestseller: true
    },
    {
        title: "The Market Gardener",
        author: "Jean-Martin Fortier",
        description: "A successful grower's handbook for small-scale organic farming. Fortier shares his methods for generating significant income from a small plot of land using intensive, biologically based practices.",
        price: 650,
        category: "Agriculture",
        genre: "Farming & Homesteading",
        stock: 25,
        isbn: "978-0865717657",
        pages: 224,
        language: "English",
        publishedDate: "2014-03-01",
        featured: true,
        bestseller: false
    },
    {
        title: "Braiding Sweetgrass",
        author: "Robin Wall Kimmerer",
        description: "Indigenous Wisdom, Scientific Knowledge, and the Teachings of Plants. A botanist explores the intersecting worlds of scientific observation and indigenous knowledge.",
        price: 450,
        category: "Agriculture",
        genre: "Nature & Ecology",
        stock: 75,
        isbn: "978-1571313560",
        pages: 390,
        language: "English",
        publishedDate: "2013-10-15",
        featured: true,
        bestseller: true
    },
    {
        title: "The One-Straw Revolution",
        author: "Masanobu Fukuoka",
        description: "An Introduction to Natural Farming. Fukuoka's manifesto on farming with minimal intervention, arguing that nature knows best how to grow food.",
        price: 399,
        category: "Agriculture",
        genre: "Organic Farming",
        stock: 40,
        isbn: "978-1590173138",
        pages: 184,
        language: "English",
        publishedDate: "1975-01-01",
        featured: false,
        bestseller: true
    },
    {
        title: "Dirt to Soil",
        author: "Gabe Brown",
        description: "One Family's Journey into Regenerative Agriculture. Brown shares how he transformed his degraded farm into a profitable, resilient, and biologically diverse enterprise.",
        price: 599,
        category: "Agriculture",
        genre: "Regenerative Agriculture",
        stock: 35,
        isbn: "978-1603587631",
        pages: 240,
        language: "English",
        publishedDate: "2018-10-11",
        featured: true,
        bestseller: false
    },
    {
        title: "Animal, Vegetable, Miracle",
        author: "Barbara Kingsolver",
        description: "A Year of Food Life. The story of a family's experiment to eat only locally grown food for an entire year, exploring the benefits of eating locally and responsibly.",
        price: 425,
        category: "Agriculture",
        genre: "Sustainable Living",
        stock: 50,
        isbn: "978-0060852559",
        pages: 384,
        language: "English",
        publishedDate: "2007-05-01",
        featured: false,
        bestseller: true
    },
    {
        title: "The Lean Farm",
        author: "Ben Hartman",
        description: "How to Minimize Waste, Increase Efficiency, and Maximize Value and Profits with Less Work. Applying Japanese lean manufacturing principles to small-scale farming.",
        price: 699,
        category: "Agriculture",
        genre: "Farm Management",
        stock: 20,
        isbn: "978-1603585927",
        pages: 256,
        language: "English",
        publishedDate: "2015-09-17",
        featured: false,
        bestseller: false
    },
    {
        title: "Folks, This Ain't Normal",
        author: "Joel Salatin",
        description: "A farmer's perspective on how our food system and culture have strayed from historical norms, and how returning to natural patterns can heal the land and ourselves.",
        price: 475,
        category: "Agriculture",
        genre: "Sustainable Agriculture",
        stock: 30,
        isbn: "978-0892968190",
        pages: 384,
        language: "English",
        publishedDate: "2011-10-10",
        featured: false,
        bestseller: false
    },
    {
        title: "Gaia's Garden",
        author: "Toby Hemenway",
        description: "A Guide to Home-Scale Permaculture. A practical manual for designing productive, ecologically sound gardens that mimic natural ecosystems.",
        price: 525,
        category: "Agriculture",
        genre: "Permaculture",
        stock: 45,
        isbn: "978-1890132521",
        pages: 328,
        language: "English",
        publishedDate: "2000-01-01",
        featured: true,
        bestseller: true
    },
    {
        title: "Finding the Mother Tree",
        author: "Suzanne Simard",
        description: "Discovering the Wisdom of the Forest. A groundbreaking scientific memoir revealing how trees communicate and cooperate through fungal networks in the soil.",
        price: 599,
        category: "Agriculture",
        genre: "Forestry & Ecology",
        stock: 55,
        isbn: "978-0525656098",
        pages: 368,
        language: "English",
        publishedDate: "2021-05-04",
        featured: true,
        bestseller: true
    },
    {
        title: "The Hidden Half of Nature",
        author: "David R. Montgomery",
        description: "The Microbial Roots of Life and Health. Exploring the striking similarities between the root systems of plants and the human gut, emphasizing the importance of microbiomes.",
        price: 550,
        category: "Agriculture",
        genre: "Soil Science",
        stock: 35,
        isbn: "978-0393244403",
        pages: 320,
        language: "English",
        publishedDate: "2015-11-16",
        featured: false,
        bestseller: false
    }
];

const seedAndFetchCovers = async () => {
    try {
        console.log('Seeding 13 new Agriculture books...');
        const insertedBooks = await Book.insertMany(agricultureBooks);
        console.log(`Successfully seeded ${insertedBooks.length} agriculture books!`);
        
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'book-covers');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        console.log('Fetching real covers from Google Books API...');
        let updatedCount = 0;

        for (const book of insertedBooks) {
            console.log(`Searching cover for: ${book.title}`);
            try {
                const query = encodeURIComponent(`${book.title} ${book.author}`);
                const gbRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3`);

                let coverUrl = null;

                if (gbRes.data.items && gbRes.data.items.length > 0) {
                    for (const item of gbRes.data.items) {
                        const volumeInfo = item.volumeInfo;
                        if (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) {
                            coverUrl = volumeInfo.imageLinks.thumbnail.replace('http:', 'https:').replace('&edge=curl', '');
                            coverUrl = coverUrl.replace('zoom=1', 'zoom=3');
                            break;
                        }
                    }
                }

                if (!coverUrl) {
                    const olRes = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
                    const docs = olRes.data.docs;
                    const docWithCover = docs.find(doc => doc.cover_i);

                    if (docWithCover) {
                        coverUrl = `https://covers.openlibrary.org/b/id/${docWithCover.cover_i}-L.jpg`;
                    }
                }

                if (coverUrl) {
                    // Download and save locally
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
                        await book.save();
                        updatedCount++;
                        console.log(`✅ Downloaded and updated cover for ${book.title}`);
                    } catch (e) {
                        console.log('Failed to download image. Using direct URL.', e.message);
                        book.coverImage = coverUrl;
                        book.image_url = coverUrl;
                        await book.save();
                        updatedCount++;
                    }
                } else {
                    console.log(`❌ No cover found for ${book.title}. Setting placeholder.`);
                    book.coverImage = `https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=600&fit=crop`; // agricultural placeholder
                    book.image_url = book.coverImage;
                    await book.save();
                }

                await sleep(1500); // Be polite to APIs
            } catch (err) {
                console.error(`Error fetching cover for ${book.title}:`, err.message);
                
                // Fallback to placeholder if fetch fails completely
                book.coverImage = `https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=600&fit=crop`;
                book.image_url = book.coverImage;
                await book.save();
                
                await sleep(2000);
            }
        }

        console.log(`Successfully fetched and updated covers for ${updatedCount} agriculture books!`);
        process.exit(0);
    } catch (error) {
        console.error('Error in seed process:', error);
        process.exit(1);
    }
};

seedAndFetchCovers();
