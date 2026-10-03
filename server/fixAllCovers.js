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

// HIGH QUALITY hardcoded cover images for books that tend to fail APIs
const hardcodedCovers = {
    // Science
    "A Brief History of Time": "https://m.media-amazon.com/images/I/A1xkFZX5k-L._SY466_.jpg",
    "The Universe in a Nutshell": "https://m.media-amazon.com/images/I/91IM+bHRVNL._SY466_.jpg",
    "Cosmos": "https://m.media-amazon.com/images/I/814rNz6mPkL._SY466_.jpg",
    "Pale Blue Dot": "https://m.media-amazon.com/images/I/71LlS1Y4bJL._SY466_.jpg",
    "Astrophysics for People in a Hurry": "https://m.media-amazon.com/images/I/71lHbBxTu3L._SY466_.jpg",
    "The Elegant Universe": "https://m.media-amazon.com/images/I/71MiXHASHML._SY466_.jpg",
    "The Fabric of the Cosmos": "https://m.media-amazon.com/images/I/91KxaHV4uNL._SY466_.jpg",
    "Seven Brief Lessons on Physics": "https://m.media-amazon.com/images/I/61yWtIqDJgL._SY466_.jpg",
    "The Order of Time": "https://m.media-amazon.com/images/I/71LxkXrH0rL._SY466_.jpg",
    "The Selfish Gene": "https://m.media-amazon.com/images/I/81FdNLzdkuL._SY466_.jpg",
    "The Blind Watchmaker": "https://m.media-amazon.com/images/I/71KvHFMO3DL._SY466_.jpg",
    "The Gene: An Intimate History": "https://m.media-amazon.com/images/I/71nT1LVgpnL._SY466_.jpg",
    "The Emperor of All Maladies": "https://m.media-amazon.com/images/I/71UNNpB5EeL._SY466_.jpg",
    "The Immortal Life of Henrietta Lacks": "https://m.media-amazon.com/images/I/81l1UJFkByL._SY466_.jpg",
    "The Hidden Life of Trees": "https://m.media-amazon.com/images/I/71P6v+PsKmL._SY466_.jpg",
    "The Body: A Guide for Occupants": "https://m.media-amazon.com/images/I/71Yb8+vJkQL._SY466_.jpg",
    "A Short History of Nearly Everything": "https://m.media-amazon.com/images/I/71nHoaQM9sL._SY466_.jpg",
    "Homo Deus": "https://m.media-amazon.com/images/I/71M5HCaqn0L._SY466_.jpg",
    "21 Lessons for the 21st Century": "https://m.media-amazon.com/images/I/71ZVLuoK5WL._SY466_.jpg",
    "Brief Answers to the Big Questions": "https://m.media-amazon.com/images/I/81K0OHiEL-L._SY466_.jpg",
    "The Grand Design": "https://m.media-amazon.com/images/I/61tFtLOuKzL._SY466_.jpg",
    "The Demon-Haunted World": "https://m.media-amazon.com/images/I/71JEsogAr+L._SY466_.jpg",
    "The Magic of Reality": "https://m.media-amazon.com/images/I/71PtBv-LHZL._SY466_.jpg",
    "The Gene Machine": "https://m.media-amazon.com/images/I/71fCuDiY1TL._SY466_.jpg",
    "The Physics of the Impossible": "https://m.media-amazon.com/images/I/71TqwenMGoL._SY466_.jpg",
    "Physics of the Future": "https://m.media-amazon.com/images/I/71n0GRdQ4CL._SY466_.jpg",
    "Parallel Worlds": "https://m.media-amazon.com/images/I/81iqB-9TVXL._SY466_.jpg",
    "Chaos": "https://m.media-amazon.com/images/I/91X+D6VRWYL._SY466_.jpg",
    "The Structure of Scientific Revolutions": "https://m.media-amazon.com/images/I/61VIsFKLVaL._SY466_.jpg",
    "Sapiens: A Brief History of Humankind": "https://m.media-amazon.com/images/I/713jIoMO3UL._SY466_.jpg",

    // Self-Development
    "Atomic Habits": "https://m.media-amazon.com/images/I/91bYsX41DVL._SY466_.jpg",
    "The 7 Habits of Highly Effective People": "https://m.media-amazon.com/images/I/71WvKXatSgL._SY466_.jpg",
    "Think and Grow Rich": "https://m.media-amazon.com/images/I/61y7sVNNFvL._SY466_.jpg",
    "Rich Dad Poor Dad": "https://m.media-amazon.com/images/I/81bsw6fnUiL._SY466_.jpg",
    "The Power of Now": "https://m.media-amazon.com/images/I/714Di43XgzL._SY466_.jpg",
    "How to Win Friends and Influence People": "https://m.media-amazon.com/images/I/71vK0WVQ4rL._SY466_.jpg",
    "The Subtle Art of Not Giving a F*ck": "https://m.media-amazon.com/images/I/71QKQ9mwV7L._SY466_.jpg",
    "Start With Why": "https://m.media-amazon.com/images/I/71F7gRDGNOL._SY466_.jpg",
    "You Can Win": "https://m.media-amazon.com/images/I/71GOM7qs8gL._SY466_.jpg",
    "Ikigai": "https://m.media-amazon.com/images/I/81l3rZK4lnL._SY466_.jpg",
    "The Alchemist": "https://m.media-amazon.com/images/I/71aFt4+OTOL._SY466_.jpg",
    "Awaken the Giant Within": "https://m.media-amazon.com/images/I/81AUc2KGhLL._SY466_.jpg",
    "Unlimited Power": "https://m.media-amazon.com/images/I/71I5mLOunaL._SY466_.jpg",
    "Think Like a Monk": "https://m.media-amazon.com/images/I/71hKuAetxhL._SY466_.jpg",
    "The Monk Who Sold His Ferrari": "https://m.media-amazon.com/images/I/71A9Y-M0nFL._SY466_.jpg",
    "Who Will Cry When You Die": "https://m.media-amazon.com/images/I/71rWlRTxJwL._SY466_.jpg",
    "The Leader Who Had No Title": "https://m.media-amazon.com/images/I/71p3S0C2snL._SY466_.jpg",
    "Deep Work": "https://m.media-amazon.com/images/I/81VM+zMJGQL._SY466_.jpg",
    "Digital Minimalism": "https://m.media-amazon.com/images/I/81KLnX4aAnL._SY466_.jpg",
    "Drive": "https://m.media-amazon.com/images/I/71fdh+bHarL._SY466_.jpg",
    "Mindset": "https://m.media-amazon.com/images/I/61XdyPMYHJL._SY466_.jpg",
    "Grit": "https://m.media-amazon.com/images/I/71k+F1q15GL._SY466_.jpg",
    "The 4-Hour Workweek": "https://m.media-amazon.com/images/I/71aBTVE3tNL._SY466_.jpg",
    "Tools of Titans": "https://m.media-amazon.com/images/I/71YdCMb+EUL._SY466_.jpg",
    "Make Your Bed": "https://m.media-amazon.com/images/I/81NHrnPjNBL._SY466_.jpg",
    "The Miracle Morning": "https://m.media-amazon.com/images/I/71jXiSrEUNL._SY466_.jpg",
    "Eat That Frog": "https://m.media-amazon.com/images/I/71aR5G4NKZL._SY466_.jpg",
    "No Excuses": "https://m.media-amazon.com/images/I/71IMZNjL3hL._SY466_.jpg",
    "Maximum Achievement": "https://m.media-amazon.com/images/I/61rvM4RLQKL._SY466_.jpg",
    "The Psychology of Money": "https://m.media-amazon.com/images/I/71g2ednj0JL._SY466_.jpg",
    "Can't Hurt Me": "https://m.media-amazon.com/images/I/81IG9CuBj0L._SY466_.jpg",
    "Never Finished": "https://m.media-amazon.com/images/I/81FovzA8inL._SY466_.jpg",
    "The One Thing": "https://m.media-amazon.com/images/I/71YGZ7WIqtL._SY466_.jpg",
    "Essentialism": "https://m.media-amazon.com/images/I/81pMK8BGPNL._SY466_.jpg",
    "The Compound Effect": "https://m.media-amazon.com/images/I/71xJPV9nyFL._SY466_.jpg",
    "Zero to One": "https://m.media-amazon.com/images/I/71bRlCOiWaL._SY466_.jpg",
    "Outliers": "https://m.media-amazon.com/images/I/71lEECT3lWL._SY466_.jpg",

    // Biography / History
    "Wings of Fire": "https://m.media-amazon.com/images/I/71VHf3MaWlL._SY466_.jpg",
    "The Diary of a Young Girl": "https://m.media-amazon.com/images/I/71WB0Ut2fAL._SY466_.jpg",
    "Long Walk to Freedom": "https://m.media-amazon.com/images/I/71y4fOG4HxL._SY466_.jpg",
    "The Story of My Experiments with Truth": "https://m.media-amazon.com/images/I/81lFg2qJeIL._SY466_.jpg",
    "Steve Jobs": "https://m.media-amazon.com/images/I/71FZe6woprL._SY466_.jpg",
    "Becoming": "https://m.media-amazon.com/images/I/81h2gWPTYJL._SY466_.jpg",
    "Einstein: His Life and Universe": "https://m.media-amazon.com/images/I/71q80plTM3L._SY466_.jpg",
    "My Life": "https://m.media-amazon.com/images/I/61+1i6FJFKL._SY466_.jpg",
    "Playing It My Way": "https://m.media-amazon.com/images/I/81AQ2HJxVmL._SY466_.jpg",
    "Elon Musk": "https://m.media-amazon.com/images/I/81e-CDavFGL._SY466_.jpg",
    "India After Gandhi": "https://m.media-amazon.com/images/I/71d+6MLgKrL._SY466_.jpg",
    "The Discovery of India": "https://m.media-amazon.com/images/I/81f6oIBiWoL._SY466_.jpg",
    "A People's History of the United States": "https://m.media-amazon.com/images/I/71J2i2DVQKL._SY466_.jpg",
    "The Rise and Fall of the Third Reich": "https://m.media-amazon.com/images/I/81g3GfQaayL._SY466_.jpg",
    "SPQR: A History of Ancient Rome": "https://m.media-amazon.com/images/I/71mGi81MHLL._SY466_.jpg",
    "The Wright Brothers": "https://m.media-amazon.com/images/I/71z3XsJAGAL._SY466_.jpg",
    "Team of Rivals": "https://m.media-amazon.com/images/I/81gx1GFtTrL._SY466_.jpg",
};

const fixAllCovers = async () => {
    try {
        await connectDB();

        // Find ALL books - we'll update any with Amazon-unavailable or placeholder covers
        const allBooks = await Book.find({});
        console.log(`Total books found: ${allBooks.length}`);

        let updated = 0;

        for (const book of allBooks) {
            const hardcover = hardcodedCovers[book.title];

            const isPlaceholder = !book.coverImage ||
                book.coverImage.includes('placehold.co') ||
                book.coverImage.includes('sample.jpg');

            // Always update to hardcoded if we have one (for quality)
            if (hardcover) {
                book.coverImage = hardcover;
                book.image_url = hardcover;
                await book.save();
                console.log(`✅ Updated high-quality cover: ${book.title}`);
                updated++;
            } else if (isPlaceholder) {
                console.log(`⚠️  No hardcoded cover found for: ${book.title}`);
            }
        }

        console.log(`\nTotal updated: ${updated}`);

        // Final count check
        const remaining = await Book.find({ coverImage: { $regex: 'placehold.co' } });
        console.log(`Remaining placeholder books: ${remaining.length}`);
        remaining.forEach(b => console.log(`  - ${b.title}`));

        process.exit(0);
    } catch (err) {
        console.error(`Error:`, err.message);
        process.exit(1);
    }
};

fixAllCovers();
