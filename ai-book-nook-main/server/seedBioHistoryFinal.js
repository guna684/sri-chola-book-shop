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

const bioHistoryBooks = [
    // --- BIOGRAPHY BOOKS ---
    {
        title: 'Wings of Fire',
        author: 'A. P. J. Abdul Kalam',
        description: "An autobiography of former Indian President A.P.J. Abdul Kalam, covering his early life, effort, hardship, fortitude, luck, and chance that eventually led him to lead Indian space research, nuclear, and missile programs.",
        price: 350,
        category: 'Biography',
        genre: 'Autobiography',
        stock: 50,
        pages: 180,
        language: 'English',
        publishedDate: new Date('1999-01-01'),
        publisher: 'Universities Press',
    },
    {
        title: 'The Diary of a Young Girl',
        author: 'Anne Frank',
        description: "Discovered in the attic in which she spent the last years of her life, Anne Frank's remarkable diary has since become a world classic—a powerful reminder of the horrors of war and an eloquent testament to the human spirit.",
        price: 299,
        category: 'Biography',
        genre: 'Memoir',
        stock: 40,
        pages: 283,
        language: 'English',
        publishedDate: new Date('1947-06-25'),
        publisher: 'Contact Publishing',
    },
    {
        title: 'Long Walk to Freedom',
        author: 'Nelson Mandela',
        description: "The autobiography of Nelson Mandela, detailing his ascent from an anti-apartheid activist and Robben Island prisoner to the first black president of South Africa.",
        price: 599,
        category: 'Biography',
        genre: 'Autobiography',
        stock: 35,
        pages: 630,
        language: 'English',
        publishedDate: new Date('1994-12-01'),
        publisher: 'Little Brown & Co',
    },
    {
        title: 'The Story of My Experiments with Truth',
        author: 'Mahatma Gandhi',
        description: "The autobiography of Mohandas K. Gandhi, covering his life from early childhood through to 1921. It was written in weekly installments and published in his journal Navjivan.",
        price: 399,
        category: 'Biography',
        genre: 'Autobiography',
        stock: 60,
        pages: 508,
        language: 'English',
        publishedDate: new Date('1927-11-01'),
        publisher: 'Navajivan Trust',
    },
    {
        title: 'Steve Jobs',
        author: 'Walter Isaacson',
        description: "The authorized self-titled biography of Apple Computer co-founder Steve Jobs. It explores his intense personality, entrepreneurial spirit, and perfectionist approach to design.",
        price: 699,
        category: 'Biography',
        genre: 'Biography',
        stock: 45,
        pages: 656,
        language: 'English',
        publishedDate: new Date('2011-10-24'),
        publisher: 'Simon & Schuster',
    },
    {
        title: 'Becoming',
        author: 'Michelle Obama',
        description: "In a life filled with meaning and accomplishment, Michelle Obama emerged as one of the most iconic and compelling women of our era. Here is her deeply personal reflection.",
        price: 550,
        category: 'Biography',
        genre: 'Memoir',
        stock: 55,
        pages: 448,
        language: 'English',
        publishedDate: new Date('2018-11-13'),
        publisher: 'Crown Publishing',
    },
    {
        title: 'Einstein: His Life and Universe',
        author: 'Walter Isaacson',
        description: "How did Einstein's mind work? What made him a genius? Isaacson's biography shows how his imagination and nonconformist brilliance led to his unparalleled discoveries.",
        price: 799,
        category: 'Biography',
        genre: 'Biography',
        stock: 25,
        pages: 675,
        language: 'English',
        publishedDate: new Date('2007-04-10'),
        publisher: 'Simon & Schuster',
    },
    {
        title: 'My Life',
        author: 'Bill Clinton',
        description: "The full and frank autobiography of President Bill Clinton. The book tells the story of an American journey—from Hope, Arkansas, to the White House.",
        price: 899,
        category: 'Biography',
        genre: 'Autobiography',
        stock: 15,
        pages: 1008,
        language: 'English',
        publishedDate: new Date('2004-06-22'),
        publisher: 'Knopf',
    },
    {
        title: 'Playing It My Way',
        author: 'Sachin Tendulkar',
        description: "The autobiography of former Indian cricketer Sachin Tendulkar. It summarizes Tendulkar's early days, his 24 years of international career and aspects of his life.",
        price: 499,
        category: 'Biography',
        genre: 'Autobiography',
        stock: 80,
        pages: 486,
        language: 'English',
        publishedDate: new Date('2014-11-06'),
        publisher: 'Hodder & Stoughton',
    },
    {
        title: 'Elon Musk',
        author: 'Ashlee Vance',
        description: "A look at the life of the entrepreneur and innovator behind SpaceX, Tesla, and SolarCity. Vance chronicles Musk's journey overcoming personal and professional challenges.",
        price: 650,
        category: 'Biography',
        genre: 'Biography',
        stock: 70,
        pages: 392,
        language: 'English',
        publishedDate: new Date('2015-05-19'),
        publisher: 'Ecco',
    },

    // --- HISTORY BOOKS ---
    {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        description: "Destroys the myth of inevitable progress. Explores how our species succeeded in the battle for dominance and shaped the world we live in.",
        price: 599,
        category: 'History',
        genre: 'World History',
        stock: 90,
        pages: 443,
        language: 'English',
        publishedDate: new Date('2011-01-01'),
        publisher: 'Harvill Secker',
    },
    {
        title: 'Guns, Germs, and Steel',
        author: 'Jared Diamond',
        description: "A short history of everybody for the last 13,000 years. Diamond argues that gaps in power and technology between human societies originate in environmental differences.",
        price: 499,
        category: 'History',
        genre: 'World History',
        stock: 30,
        pages: 480,
        language: 'English',
        publishedDate: new Date('1997-03-01'),
        publisher: 'W. W. Norton',
    },
    {
        title: 'The Silk Roads',
        author: 'Peter Frankopan',
        description: "A New History of the World. Frankopan argues that the center of global history lies in the Middle East and the historic Silk Roads.",
        price: 750,
        category: 'History',
        genre: 'World History',
        stock: 20,
        pages: 656,
        language: 'English',
        publishedDate: new Date('2015-08-27'),
        publisher: 'Bloomsbury Publishing',
    },
    {
        title: 'India After Gandhi',
        author: 'Ramachandra Guha',
        description: "A comprehensive history of the world's largest democracy since its independence in 1947, exploring the pain and pride of a massive, multi-faceted nation.",
        price: 850,
        category: 'History',
        genre: 'Indian History',
        stock: 65,
        pages: 944,
        language: 'English',
        publishedDate: new Date('2007-04-20'),
        publisher: 'Pan Macmillan',
    },
    {
        title: 'The Discovery of India',
        author: 'Jawaharlal Nehru',
        description: "Written during Nehru's imprisonment at Ahmednagar Fort by the British, this book provides a broad view of Indian history, philosophy, and culture.",
        price: 450,
        category: 'History',
        genre: 'Indian History',
        stock: 45,
        pages: 642,
        language: 'English',
        publishedDate: new Date('1946-01-01'),
        publisher: 'Signet Press',
    },
    {
        title: "A People's History of the United States",
        author: 'Howard Zinn',
        description: "Presents American history through the eyes of the common people rather than political and economic elites, offering a profound perspective on the nation's past.",
        price: 699,
        category: 'History',
        genre: 'US History',
        stock: 25,
        pages: 729,
        language: 'English',
        publishedDate: new Date('1980-01-01'),
        publisher: 'Harper & Row',
    },
    {
        title: 'The Rise and Fall of the Third Reich',
        author: 'William L. Shirer',
        description: "A comprehensive and monumental history of Nazi Germany. Shirer draws on his experiences as an American journalist reporting from Germany before World War II.",
        price: 999,
        category: 'History',
        genre: 'European History',
        stock: 15,
        pages: 1245,
        language: 'English',
        publishedDate: new Date('1960-10-11'),
        publisher: 'Simon & Schuster',
    },
    {
        title: 'SPQR: A History of Ancient Rome',
        author: 'Mary Beard',
        description: "A sweeping update of Roman history that spans 1,000 years, exploring how a small Italian village grew to conquer a vast territory.",
        price: 650,
        category: 'History',
        genre: 'Ancient History',
        stock: 35,
        pages: 608,
        language: 'English',
        publishedDate: new Date('2015-10-20'),
        publisher: 'Profile Books',
    },
    {
        title: 'The Wright Brothers',
        author: 'David McCullough',
        description: "The dramatic story-behind-the-story about the courageous brothers who taught the world how to fly, overcoming enormous odds and initial ridicule.",
        price: 599,
        category: 'History',
        genre: 'Aviation History',
        stock: 50,
        pages: 320,
        language: 'English',
        publishedDate: new Date('2015-05-05'),
        publisher: 'Simon & Schuster',
    },
    {
        title: 'Team of Rivals',
        author: 'Doris Kearns Goodwin',
        description: "The political genius of Abraham Lincoln. An illuminating biography that shows how Lincoln brought disgruntled opponents together to navigate the Civil War.",
        price: 850,
        category: 'History',
        genre: 'US History',
        stock: 40,
        pages: 944,
        language: 'English',
        publishedDate: new Date('2005-10-25'),
        publisher: 'Simon & Schuster',
    }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const seedBooks = async () => {
    try {
        await connectDB();

        console.log('Final Seeding Bibliography and History Books Phase...');

        // Read generated covers
        const generatedCoversPath = path.join(__dirname, 'generated_covers.json');
        let generatedCoversMap = {};
        if (fs.existsSync(generatedCoversPath)) {
            generatedCoversMap = JSON.parse(fs.readFileSync(generatedCoversPath, 'utf8'));
        }

        const createdBooks = [];

        for (const bookData of bioHistoryBooks) {
            console.log(`Processing: ${bookData.title}`);
            const existingGeneratedCover = generatedCoversMap[bookData.title];

            if (existingGeneratedCover) {
                bookData.coverImage = existingGeneratedCover;
                bookData.image_url = existingGeneratedCover;
            } else {
                // Fallback to real covers from generic Google APIs
                console.log(`No generated cover found, fetching real cover for ${bookData.title}...`);
                try {
                    const query = encodeURIComponent(`${bookData.title}`);
                    const gbRes = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);

                    let coverUrl = null;
                    if (gbRes.data.items && gbRes.data.items.length > 0) {
                        const volumeInfo = gbRes.data.items[0].volumeInfo;
                        if (volumeInfo.imageLinks && (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail)) {
                            coverUrl = (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail).replace('http:', 'https:').replace('&edge=curl', '');
                            coverUrl = coverUrl.replace('zoom=1', 'zoom=2');
                        }
                    }

                    if (coverUrl) {
                        bookData.coverImage = coverUrl;
                        bookData.image_url = coverUrl;
                    } else {
                        bookData.coverImage = `https://placehold.co/600x900/1e293b/f8fafc.png?text=${encodeURIComponent(bookData.title)}`;
                        bookData.image_url = bookData.coverImage;
                    }
                } catch (e) {
                    console.error(`Google API failed for ${bookData.title}`);
                    bookData.coverImage = `https://placehold.co/600x900/1e293b/f8fafc.png?text=${encodeURIComponent(bookData.title)}`;
                    bookData.image_url = bookData.coverImage;
                }
                await sleep(1000);
            }

            const createdBook = await Book.create(bookData);
            createdBooks.push(createdBook);
        }

        console.log(`Success! Inserted ${createdBooks.length} books!`);
        process.exit();

    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

seedBooks();
