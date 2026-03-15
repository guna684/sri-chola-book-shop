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

const newMysteryBooks = [
    {
        title: "The Silent Patient",
        author: "Alex Michaelides",
        description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house in one of London's most desirable areas. One evening her husband returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
        price: 399,
        category: "Mystery",
        genre: "Psychological Thriller",
        stock: 50,
        isbn: "978-1250301697",
        pages: 336,
        language: "English",
        publishedDate: "2019-02-05",
        featured: true,
        bestseller: true
    },
    {
        title: "And Then There Were None",
        author: "Agatha Christie",
        description: "Ten people, each with something to hide and something to fear, are invited to an isolated mansion on Indian Island by a host who, surprisingly, fails to appear.",
        price: 299,
        category: "Mystery",
        genre: "Classic Mystery",
        stock: 45,
        isbn: "978-0062073488",
        pages: 264,
        language: "English",
        publishedDate: "1939-11-06",
        featured: true,
        bestseller: true
    },
    {
        title: "The Da Vinci Code",
        author: "Dan Brown",
        description: "While in Paris, Harvard symbologist Robert Langdon is awakened by a phone call in the dead of the night. The elderly curator of the Louvre has been murdered inside the museum, his body covered in baffling symbols.",
        price: 499,
        category: "Mystery",
        genre: "Conspiracy Thriller",
        stock: 80,
        isbn: "978-0385504205",
        pages: 489,
        language: "English",
        publishedDate: "2003-03-18",
        featured: true,
        bestseller: true
    },
    {
        title: "Big Little Lies",
        author: "Liane Moriarty",
        description: "A murder...A tragic accident...Or just parents behaving badly? What's indisputable is that someone is dead. Madeline is a force to be reckoned with. She's funny, biting, and passionate.",
        price: 349,
        category: "Mystery",
        genre: "Domestic Thriller",
        stock: 40,
        isbn: "978-0399167065",
        pages: 460,
        language: "English",
        publishedDate: "2014-07-29",
        featured: false,
        bestseller: true
    },
    {
        title: "Dark Places",
        author: "Gillian Flynn",
        description: "Libby Day was seven when her mother and two sisters were murdered in The Satan Sacrifice of Kinnakee, Kansas. She survived and famously testified that her fifteen-year-old brother, Ben, was the killer.",
        price: 359,
        category: "Mystery",
        genre: "Crime Thriller",
        stock: 35,
        isbn: "978-0307341570",
        pages: 349,
        language: "English",
        publishedDate: "2009-05-05",
        featured: false,
        bestseller: false
    },
    {
        title: "The Night Circus",
        author: "Erin Morgenstern",
        description: "The circus arrives without warning. No announcements precede it. It is simply there, when yesterday it was not. Within the black-and-white striped canvas tents is an utterly unique experience full of breathtaking amazements.",
        price: 450,
        category: "Mystery",
        genre: "Fantasy Mystery",
        stock: 60,
        isbn: "978-0385534635",
        pages: 387,
        language: "English",
        publishedDate: "2011-09-13",
        featured: true,
        bestseller: true
    },
    {
        title: "In a Dark, Dark Wood",
        author: "Ruth Ware",
        description: "What should be a cozy and fun-filled weekend deep in the English countryside takes a sinister turn in Ruth Ware's suspenseful, compulsive, and darkly twisted psychological thriller.",
        price: 349,
        category: "Mystery",
        genre: "Psychological Thriller",
        stock: 45,
        isbn: "978-1501112700",
        pages: 354,
        language: "English",
        publishedDate: "2015-08-04",
        featured: false,
        bestseller: false
    },
    {
        title: "Defending Jacob",
        author: "William Landay",
        description: "Andy Barber has been an assistant district attorney for two decades. But when a shocking crime shatters their New England town, Andy is blindsided by what happens next.",
        price: 389,
        category: "Mystery",
        genre: "Legal Thriller",
        stock: 30,
        isbn: "978-0345533661",
        pages: 421,
        language: "English",
        publishedDate: "2012-01-31",
        featured: false,
        bestseller: true
    },
    {
        title: "The Good Girl",
        author: "Mary Kubica",
        description: "I've been following her for the past few days. I know where she buys her groceries, where she has her dry cleaning done, where she works. I don't know the color of her eyes or what they look like when she's scared.",
        price: 329,
        category: "Mystery",
        genre: "Psychological Suspense",
        stock: 25,
        isbn: "978-0778316558",
        pages: 352,
        language: "English",
        publishedDate: "2014-07-29",
        featured: false,
        bestseller: false
    },
    {
        title: "The cuckoo's calling",
        author: "Robert Galbraith",
        description: "After losing his leg to a land mine in Afghanistan, Cormoran Strike is barely scraping by as a private investigator. Then John Bristow walks through his door with an amazing story.",
        price: 429,
        category: "Mystery",
        genre: "Detective Fiction",
        stock: 55,
        isbn: "978-0316206846",
        pages: 456,
        language: "English",
        publishedDate: "2013-04-18",
        featured: true,
        bestseller: true
    },
    {
        title: "The snowman",
        author: "Jo Nesbø",
        description: "One night, after the first snowfall of the year, a boy named Jonas wakes up and discovers that his mother has disappeared. Only one trace of her remains: a pink scarf, his Christmas gift to her, now worn by the snowman.",
        price: 379,
        category: "Mystery",
        genre: "Nordic Noir",
        stock: 40,
        isbn: "978-0307742995",
        pages: 560,
        language: "English",
        publishedDate: "2007-06-01",
        featured: false,
        bestseller: true
    },
    {
        title: "Before I Go to Sleep",
        author: "S.J. Watson",
        description: "Memories define us. So what if you lost yours every time you went to sleep? Your name, your identity, your past, even the people you love--all forgotten overnight.",
        price: 349,
        category: "Mystery",
        genre: "Psychological Thriller",
        stock: 35,
        isbn: "978-0062060563",
        pages: 359,
        language: "English",
        publishedDate: "2011-06-14",
        featured: false,
        bestseller: false
    },
    {
        title: "The Dry",
        author: "Jane Harper",
        description: "A small town hides big secrets in this atmospheric, page-turning debut mystery by award-winning author Jane Harper. After getting a note demanding his presence, Federal Agent Aaron Falk arrives in his hometown.",
        price: 389,
        category: "Mystery",
        genre: "Rural Noir",
        stock: 50,
        isbn: "978-1250105608",
        pages: 328,
        language: "English",
        publishedDate: "2017-01-10",
        featured: true,
        bestseller: true
    },
    {
        title: "Behind Closed Doors",
        author: "B.A. Paris",
        description: "Everyone knows a couple like Jack and Grace. He has looks and wealth; she has charm and elegance. You'd love to get to know Grace better. But it's difficult, because you realize Jack and Grace are never apart.",
        price: 319,
        category: "Mystery",
        genre: "Psychological Thriller",
        stock: 30,
        isbn: "978-1250132369",
        pages: 293,
        language: "English",
        publishedDate: "2016-08-09",
        featured: false,
        bestseller: true
    },
    {
        title: "Sometimes I Lie",
        author: "Alice Feeney",
        description: "My name is Amber Reynolds. There are three things you should know about me: 1. I'm in a coma. 2. My husband doesn't love me anymore. 3. Sometimes I lie.",
        price: 339,
        category: "Mystery",
        genre: "Psychological Thriller",
        stock: 25,
        isbn: "978-1250144843",
        pages: 261,
        language: "English",
        publishedDate: "2018-03-13",
        featured: false,
        bestseller: false
    }
];

const seedAndFetchCovers = async () => {
    try {
        console.log('Seeding 15 new Mystery books...');
        const insertedBooks = await Book.insertMany(newMysteryBooks);
        console.log(`Successfully seeded ${insertedBooks.length} mystery books!`);
        
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
                    book.coverImage = `https://placehold.co/400x600/1e293b/ffffff.png?text=${encodeURIComponent(book.title)}`;
                    book.image_url = book.coverImage;
                    await book.save();
                }

                await sleep(1500); // Be polite to APIs
            } catch (err) {
                console.error(`Error fetching cover for ${book.title}:`, err.message);
                
                // Fallback to placeholder if fetch fails completely
                book.coverImage = `https://placehold.co/400x600/1e293b/ffffff.png?text=${encodeURIComponent(book.title)}`;
                book.image_url = book.coverImage;
                await book.save();
                
                await sleep(2000);
            }
        }

        console.log(`Successfully fetched and updated covers for ${updatedCount} books!`);
        process.exit(0);
    } catch (error) {
        console.error('Error in seed process:', error);
        process.exit(1);
    }
};

seedAndFetchCovers();
