import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config({ path: './server/.env' });
connectDB();

const coverUpdates = [
    { title: "The Woman in the Window", image: "/uploads/books/woman_in_the_window.png" },
    { title: "Sharp Objects", image: "/uploads/books/sharp_objects.png" },
    { title: "The Guest List", image: "/uploads/books/the_guest_list.png" },
    { title: "The Hunting Party", image: "/uploads/books/the_hunting_party.png" },
    { title: "Verity", image: "/uploads/books/verity.png" },
    { title: "The 7 1/2 Deaths of Evelyn Hardcastle", image: "/uploads/books/evelyn_hardcastle.png" },
    { title: "The Maidens", image: "/uploads/books/the_maidens.png" },
    { title: "One by One", image: "/uploads/books/one_by_one.png" },
    { title: "The Shadow of the Wind", image: "/uploads/books/shadow_of_the_wind.png" },
    { title: "In the Woods", image: "/uploads/books/in_the_woods.png" },
    { title: "The Thirteenth Tale", image: "/uploads/books/thirteenth_tale.png" },
    { title: "The Devotion of Suspect X", image: "/uploads/books/suspect_x.png" }
];

const updateCovers = async () => {
    try {
        console.log('Updating book covers...');
        for (const update of coverUpdates) {
            const result = await Book.updateOne(
                { title: update.title },
                { $set: { coverImage: update.image, image_url: update.image } }
            );
            if (result.modifiedCount > 0) {
                console.log(`✅ Updated cover for: ${update.title}`);
            } else {
                console.log(`ℹ️ No changes or book not found: ${update.title}`);
            }
        }
        console.log('All updates completed!');
        process.exit();
    } catch (error) {
        console.error('Error updating covers:', error);
        process.exit(1);
    }
};

updateCovers();
