import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();

const coversMap = {
    "Ponniyin Selvan - Part 1: Pudhu Vellam": "https://m.media-amazon.com/images/I/910wX9O2ZTL._AC_UF1000,1000_QL80_.jpg",
    "Ponniyin Selvan - Part 2: Suzhal Kaatru": "https://m.media-amazon.com/images/I/810-D+fB07L._AC_UF1000,1000_QL80_.jpg",
    "Ponniyin Selvan - Part 3: Kolai Vaal": "https://m.media-amazon.com/images/I/81B+G7oBkuL._AC_UF1000,1000_QL80_.jpg",
    "Ponniyin Selvan - Part 4: Mani Magudam": "https://m.media-amazon.com/images/I/81Wn26Kij6L._AC_UF1000,1000_QL80_.jpg",
    "Ponniyin Selvan - Part 5: Thiyaga Sigaram": "https://m.media-amazon.com/images/I/81I23k9wOUL._AC_UF1000,1000_QL80_.jpg",
    "Sivagamiyin Sabatham": "https://m.media-amazon.com/images/I/81u5fFzKRsL._AC_UF1000,1000_QL80_.jpg",
    "Parthiban Kanavu": "https://m.media-amazon.com/images/I/71X8k7+xWcL._AC_UF1000,1000_QL80_.jpg",
    "Alai Osai": "https://m.media-amazon.com/images/I/71-oYv-eI3L._AC_UF1000,1000_QL80_.jpg",
    "Kadal Pura": "https://m.media-amazon.com/images/I/81tXbH7IixL._AC_UF1000,1000_QL80_.jpg",
    "Yavana Rani": "https://m.media-amazon.com/images/I/81b2vVp7R4L._AC_UF1000,1000_QL80_.jpg",
    "Mannan Magal": "https://m.media-amazon.com/images/I/81W7z1x47LL._AC_UF1000,1000_QL80_.jpg",
    "Jala Deepam": "https://m.media-amazon.com/images/I/71Yv0-4E8kL._AC_UF1000,1000_QL80_.jpg",
    "Vengayin Maindhan": "https://m.media-amazon.com/images/I/81f-xGgqZfL._AC_UF1000,1000_QL80_.jpg",
    "Chithira Pavai": "https://m.media-amazon.com/images/I/71Vp7I8E9tL._AC_UF1000,1000_QL80_.jpg",
    "Kayalvizhi": "https://m.media-amazon.com/images/I/71B9BvFwXPL._AC_UF1000,1000_QL80_.jpg",
    "Sila Nerangalil Sila Manithargal": "https://m.media-amazon.com/images/I/81Ff7bZ-MhL._AC_UF1000,1000_QL80_.jpg",
    "Oru Nadigai Natakam Parkiral": "https://m.media-amazon.com/images/I/71pB-gI8g5L._AC_UF1000,1000_QL80_.jpg",
    "Oru Manithan Oru Veedu Oru Ulagam": "https://m.media-amazon.com/images/I/81H+VvBwGHL._AC_UF1000,1000_QL80_.jpg",
    "Yaarukkaga Azhudhaan": "https://m.media-amazon.com/images/I/71d-aD09VpL._AC_UF1000,1000_QL80_.jpg",
    "En Iniya Iyenthira": "https://m.media-amazon.com/images/I/71Yh+5-11kL._AC_UF1000,1000_QL80_.jpg",
    "Meendum Jeeno": "https://m.media-amazon.com/images/I/71XZ2+y07gL._AC_UF1000,1000_QL80_.jpg",
    "Karaiyellam Shenbagapoo": "https://m.media-amazon.com/images/I/81R6-fP-hML._AC_UF1000,1000_QL80_.jpg",
    "Srirangathu Devathaigal": "https://m.media-amazon.com/images/I/81gL1u0L+TL._AC_UF1000,1000_QL80_.jpg",
    "Aram": "https://m.media-amazon.com/images/I/81H2iLhZ7SL._AC_UF1000,1000_QL80_.jpg",
    "Vishnupuram": "https://m.media-amazon.com/images/I/81o+jZ1t8SL._AC_UF1000,1000_QL80_.jpg",
    "Venmurasu - Mutham": "https://m.media-amazon.com/images/I/71J+VXY2PzL._AC_UF1000,1000_QL80_.jpg",
    "Oru Puliyamarathin Kathai": "https://m.media-amazon.com/images/I/71b29Z72a2L._AC_UF1000,1000_QL80_.jpg",
    "J.J. Sila Kurippugal": "https://m.media-amazon.com/images/I/71qZ-+A-h8L._AC_UF1000,1000_QL80_.jpg",
    "Karukku": "https://m.media-amazon.com/images/I/71D0Yn-+U0L._AC_UF1000,1000_QL80_.jpg",
    "Sangathi": "https://m.media-amazon.com/images/I/71T8Jk-w8gL._AC_UF1000,1000_QL80_.jpg",
    "Kuruthipunal": "https://m.media-amazon.com/images/I/81D7mO9eA8L._AC_UF1000,1000_QL80_.jpg",
    "Vethala Ulagam": "https://m.media-amazon.com/images/I/71a-+l2pWUL._AC_UF1000,1000_QL80_.jpg",
    "Pudhumaipithan Kathaigal": "https://m.media-amazon.com/images/I/81XZ-s-O0mL._AC_UF1000,1000_QL80_.jpg",
    "Moga Mul": "https://m.media-amazon.com/images/I/81u2PZk91fL._AC_UF1000,1000_QL80_.jpg",
    "Amma Vandhaal": "https://m.media-amazon.com/images/I/81-p+5iX0eL._AC_UF1000,1000_QL80_.jpg",
    "Gopallapuram": "https://m.media-amazon.com/images/I/81m8H+o1WML._AC_UF1000,1000_QL80_.jpg",
    "Karisal Kathaigal": "https://m.media-amazon.com/images/I/71Z-5xV+WQL._AC_UF1000,1000_QL80_.jpg",
    "Velpari": "https://m.media-amazon.com/images/I/81D3vH2+Z2L._AC_UF1000,1000_QL80_.jpg",
    "Kaval Kottam": "https://m.media-amazon.com/images/I/81n-l-+eHCL._AC_UF1000,1000_QL80_.jpg",
    "Thanneer": "https://m.media-amazon.com/images/I/71R1+-5E9mL._AC_UF1000,1000_QL80_.jpg"
};

const defaultCover = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

const fixCovers = async () => {
    try {
        await connectDB();

        console.log('Fixing Tamil Literature covers with high-quality Amazon URLs...');
        const books = await Book.find({ category: 'Tamil Literature' });

        let updatedCount = 0;
        for (const book of books) {
            const url = coversMap[book.title];
            if (url) {
                // To avoid hotlinking blocks on frontend, let's keep the amazon links, they usually work well
                // but if they don't, we can fallback to openlibrary or generic
                book.coverImage = url;
                book.image_url = url;
                await book.save();
                updatedCount++;
                console.log(`Updated: ${book.title}`);
            } else {
                book.coverImage = defaultCover;
                book.image_url = defaultCover;
                await book.save();
            }
        }

        console.log(`Successfully fixed covers for ${updatedCount} books!`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixCovers();
