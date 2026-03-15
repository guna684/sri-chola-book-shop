import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function updateLowStock() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const booksCollection = db.collection('books');

    // Pick 8 random books and set their stock to values under 20
    const allBooks = await booksCollection.find({ title: { $ne: 'Sample name' } }).toArray();
    
    if (allBooks.length === 0) {
        console.log('No books found!');
        await mongoose.disconnect();
        return;
    }

    // Shuffle and pick 8 random books
    const shuffled = allBooks.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 8);
    
    const lowStockValues = [2, 5, 7, 10, 3, 12, 15, 18];

    for (let i = 0; i < selected.length; i++) {
        const book = selected[i];
        const newStock = lowStockValues[i];
        await booksCollection.updateOne(
            { _id: book._id },
            { $set: { stock: newStock } }
        );
        console.log(`Updated "${book.title}" -> stock: ${newStock}`);
    }

    // Also delete the sample book if it exists
    const deleted = await booksCollection.deleteMany({ title: 'Sample name' });
    if (deleted.deletedCount > 0) {
        console.log(`Deleted ${deleted.deletedCount} sample book(s)`);
    }

    console.log('\nDone! 8 books now have low stock (under 20).');
    await mongoose.disconnect();
}

updateLowStock().catch(console.error);
