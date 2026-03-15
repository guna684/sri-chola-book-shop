import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config({ path: './server/.env' });
connectDB();

const coverUpdates = [
    { title: "The Song of Achilles", isbn: "9780062060624" },
    { title: "Lessons in Chemistry", isbn: "9780385547345" },
    { title: "Tomorrow, and Tomorrow, and Tomorrow", isbn: "9780593321201" },
    { title: "Great Expectations", isbn: "9780141439563" },
    { title: "Pride and Prejudice", isbn: "9780141439518" },
    { title: "1984", isbn: "9780451524935" },
    { title: "To Kill a Mockingbird", isbn: "9780060935467" },
    { title: "Little Women", isbn: "9780147514011" },
    { title: "Frankenstein", isbn: "9780141439471" },
    { title: "Wuthering Heights", isbn: "9780141439556" },
    { title: "Jane Eyre", isbn: "9780141441146" },
    { title: "The Picture of Dorian Gray", isbn: "9780141439570" },
    { title: "The Catcher in the Rye", isbn: "9780316769488" },
    { title: "Beloved", isbn: "9781400033416" },
    { title: "One Hundred Years of Solitude", isbn: "9780060883287" },
    { title: "The Kite Runner", isbn: "9781594631931" },
    { title: "Life of Pi", isbn: "9780156027328" },
    { title: "Never Let Me Go", isbn: "9781400078776" },
    { title: "A Thousand Splendid Suns", isbn: "9781594489501" },
    { title: "The Night Circus", isbn: "9780307744432" }
];

const updateCovers = async () => {
    try {
        console.log('Updating 20 Fiction book covers using Open Library API...');

        for (const update of coverUpdates) {
            const coverUrl = `https://covers.openlibrary.org/b/isbn/${update.isbn}-L.jpg`;

            const result = await Book.updateOne(
                { title: update.title },
                {
                    $set: {
                        coverImage: coverUrl,
                        image_url: coverUrl
                    }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ Updated cover for: ${update.title}`);
            } else {
                console.log(`ℹ️ No changes or book not found for: ${update.title}`);
            }
        }

        console.log('Successfully updated fiction book covers!');
        process.exit();
    } catch (error) {
        console.error('Error updating fiction covers:', error);
        process.exit(1);
    }
};

updateCovers();
