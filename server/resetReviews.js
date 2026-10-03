import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function resetReviews() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const booksCollection = db.collection('books');

    const result = await booksCollection.updateMany(
        {},
        { $set: { reviews: [], numReviews: 0, rating: 0 } }
    );

    console.log(`Updated ${result.modifiedCount} books — all reviews set to zero.`);
    await mongoose.disconnect();
}

resetReviews().catch(console.error);
