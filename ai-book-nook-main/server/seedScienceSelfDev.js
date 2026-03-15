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

const booksData = [
    // --- SCIENCE BOOKS (30) ---
    { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science" },
    { title: "The Universe in a Nutshell", author: "Stephen Hawking", category: "Science" },
    { title: "Cosmos", author: "Carl Sagan", category: "Science" },
    { title: "Pale Blue Dot", author: "Carl Sagan", category: "Science" },
    { title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", category: "Science" },
    { title: "The Elegant Universe", author: "Brian Greene", category: "Science" },
    { title: "The Fabric of the Cosmos", author: "Brian Greene", category: "Science" },
    { title: "Seven Brief Lessons on Physics", author: "Carlo Rovelli", category: "Science" },
    { title: "The Order of Time", author: "Carlo Rovelli", category: "Science" },
    { title: "The Selfish Gene", author: "Richard Dawkins", category: "Science" },
    { title: "The Blind Watchmaker", author: "Richard Dawkins", category: "Science" },
    { title: "The Gene: An Intimate History", author: "Siddhartha Mukherjee", category: "Science" },
    { title: "The Emperor of All Maladies", author: "Siddhartha Mukherjee", category: "Science" },
    { title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", category: "Science" },
    { title: "The Hidden Life of Trees", author: "Peter Wohlleben", category: "Science" },
    { title: "The Body: A Guide for Occupants", author: "Bill Bryson", category: "Science" },
    { title: "A Short History of Nearly Everything", author: "Bill Bryson", category: "Science" },
    { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "Science" },
    { title: "Homo Deus", author: "Yuval Noah Harari", category: "Science" },
    { title: "21 Lessons for the 21st Century", author: "Yuval Noah Harari", category: "Science" },
    { title: "Brief Answers to the Big Questions", author: "Stephen Hawking", category: "Science" },
    { title: "The Grand Design", author: "Stephen Hawking", category: "Science" },
    { title: "The Demon-Haunted World", author: "Carl Sagan", category: "Science" },
    { title: "The Magic of Reality", author: "Richard Dawkins", category: "Science" },
    { title: "The Gene Machine", author: "Venki Ramakrishnan", category: "Science" },
    { title: "The Physics of the Impossible", author: "Michio Kaku", category: "Science" },
    { title: "Physics of the Future", author: "Michio Kaku", category: "Science" },
    { title: "Parallel Worlds", author: "Michio Kaku", category: "Science" },
    { title: "Chaos", author: "James Gleick", category: "Science" },
    { title: "The Structure of Scientific Revolutions", author: "Thomas S. Kuhn", category: "Science" },

    // --- SELF-DEVELOPMENT (37) ---
    { title: "Atomic Habits", author: "James Clear", category: "Self-Development" },
    { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", category: "Self-Development" },
    { title: "Think and Grow Rich", author: "Napoleon Hill", category: "Self-Development" },
    { title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", category: "Self-Development" },
    { title: "The Power of Now", author: "Eckhart Tolle", category: "Self-Development" },
    { title: "How to Win Friends and Influence People", author: "Dale Carnegie", category: "Self-Development" },
    { title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", category: "Self-Development" },
    { title: "Start With Why", author: "Simon Sinek", category: "Self-Development" },
    { title: "You Can Win", author: "Shiv Khera", category: "Self-Development" },
    { title: "Ikigai", author: "Hector Garcia", category: "Self-Development" },
    { title: "The Alchemist", author: "Paulo Coelho", category: "Self-Development" },
    { title: "Awaken the Giant Within", author: "Tony Robbins", category: "Self-Development" },
    { title: "Unlimited Power", author: "Tony Robbins", category: "Self-Development" },
    { title: "Think Like a Monk", author: "Jay Shetty", category: "Self-Development" },
    { title: "The Monk Who Sold His Ferrari", author: "Robin Sharma", category: "Self-Development" },
    { title: "Who Will Cry When You Die", author: "Robin Sharma", category: "Self-Development" },
    { title: "The Leader Who Had No Title", author: "Robin Sharma", category: "Self-Development" },
    { title: "Deep Work", author: "Cal Newport", category: "Self-Development" },
    { title: "Digital Minimalism", author: "Cal Newport", category: "Self-Development" },
    { title: "Drive", author: "Daniel H. Pink", category: "Self-Development" },
    { title: "Mindset", author: "Carol S. Dweck", category: "Self-Development" },
    { title: "Grit", author: "Angela Duckworth", category: "Self-Development" },
    { title: "The 4-Hour Workweek", author: "Timothy Ferriss", category: "Self-Development" },
    { title: "Tools of Titans", author: "Timothy Ferriss", category: "Self-Development" },
    { title: "Make Your Bed", author: "William H. McRaven", category: "Self-Development" },
    { title: "The Miracle Morning", author: "Hal Elrod", category: "Self-Development" },
    { title: "Eat That Frog", author: "Brian Tracy", category: "Self-Development" },
    { title: "No Excuses", author: "Brian Tracy", category: "Self-Development" },
    { title: "Maximum Achievement", author: "Brian Tracy", category: "Self-Development" },
    { title: "The Psychology of Money", author: "Morgan Housel", category: "Self-Development" },
    { title: "Can't Hurt Me", author: "David Goggins", category: "Self-Development" },
    { title: "Never Finished", author: "David Goggins", category: "Self-Development" },
    { title: "The One Thing", author: "Gary Keller", category: "Self-Development" },
    { title: "Essentialism", author: "Greg McKeown", category: "Self-Development" },
    { title: "The Compound Effect", author: "Darren Hardy", category: "Self-Development" },
    { title: "Zero to One", author: "Peter Thiel", category: "Self-Development" },
    { title: "Outliers", author: "Malcolm Gladwell", category: "Self-Development" }
];

const seedBooks = async () => {
    try {
        await connectDB();
        console.log(`Starting to seed ${booksData.length} Science & Self-Development Books...`);

        const uploadsDir = path.join(__dirname, 'uploads', 'book-covers');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        let inserted = 0;

        for (const data of booksData) {
            console.log(`Processing: ${data.title}`);

            let finalImageUrl = `https://placehold.co/600x900/1e293b/f8fafc.png?text=${encodeURIComponent(data.title)}`;

            // Try fetching real cover from Google Books
            try {
                const query = encodeURIComponent(`${data.title} ${data.author}`);
                const gbRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);

                if (gbRes.data.items && gbRes.data.items.length > 0) {
                    const volumeInfo = gbRes.data.items[0].volumeInfo;
                    if (volumeInfo.imageLinks) {
                        const thumb = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail;
                        if (thumb) {
                            finalImageUrl = thumb.replace('http:', 'https:').replace('&edge=curl', '');
                            finalImageUrl = finalImageUrl.replace('zoom=1', 'zoom=2'); // better quality
                        }
                    }
                }
            } catch (e) {
                console.log(`Google API failed for ${data.title}, using fallback`);
            }

            let localImagePath = finalImageUrl;

            // Download the image locally to avoid external link rot
            if (finalImageUrl.includes('books.google')) {
                try {
                    const imageResponse = await axios({
                        url: finalImageUrl,
                        method: 'GET',
                        responseType: 'stream'
                    });

                    const fileName = `sci_selfdev_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
                    const filePath = path.join(uploadsDir, fileName);

                    const writer = fs.createWriteStream(filePath);
                    imageResponse.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    localImagePath = `/uploads/book-covers/${fileName}`;
                } catch (e) {
                    console.log(`Failed to download ${data.title} cover, using direct URL`);
                }
            }

            const bookDoc = {
                title: data.title,
                author: data.author,
                category: data.category,
                genre: data.category === 'Science' ? 'Popular Science' : 'Self-Help',
                price: Math.floor(Math.random() * (900 - 300 + 1) + 300),
                originalPrice: Math.floor(Math.random() * (1500 - 1000 + 1) + 1000),
                description: `An amazing block-buster book titled ${data.title} by the renowned author ${data.author}.`,
                stock: Math.floor(Math.random() * 50) + 10,
                pages: Math.floor(Math.random() * 400) + 200,
                language: 'English',
                coverImage: localImagePath,
                image_url: localImagePath,
                rating: (Math.random() * (5 - 4) + 4).toFixed(1),
                reviewCount: Math.floor(Math.random() * 500) + 50
            };

            await Book.create(bookDoc);
            inserted++;
            console.log(`✅ Added ${data.title}`);

            await sleep(500); // Be polite to Google API
        }

        console.log(`Success! Inserted ${inserted} books.`);
        process.exit(0);

    } catch (err) {
        console.error(`Error:`, err);
        process.exit(1);
    }
};

seedBooks();
