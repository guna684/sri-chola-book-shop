import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';

dotenv.config({ path: './server/.env' });

const categories = [
    { name: 'Fiction', slug: 'fiction', icon: '📖', description: 'Fictional stories and novels', bookCount: 245 },
    { name: 'Non-Fiction', slug: 'non-fiction', icon: '📚', description: 'Real-world topics and factual content', bookCount: 189 },
    { name: 'Mystery', slug: 'mystery', icon: '🔍', description: 'Mystery and thriller books', bookCount: 156 },
    { name: 'Romance', slug: 'romance', icon: '💕', description: 'Romantic stories and love tales', bookCount: 203 },
    { name: 'Science Fiction', slug: 'sci-fi', icon: '🚀', description: 'Futuristic and sci-fi adventures', bookCount: 134 },
    { name: 'Self-Improvement', slug: 'self-improvement', icon: '✨', description: 'Personal development and growth', bookCount: 178 },
    { name: 'Biography', slug: 'biography', icon: '👤', description: 'Life stories of notable people', bookCount: 112 },
    { name: "Children's", slug: 'childrens', icon: '🧸', description: 'Books for young readers', bookCount: 167 },
];

const seedCategories = async () => {
    try {
        await connectDB();

        // Clear existing categories
        await Category.deleteMany({});
        console.log('Cleared existing categories');

        // Insert new categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ Successfully seeded ${createdCategories.length} categories`);

        createdCategories.forEach(cat => {
            console.log(`   - ${cat.icon} ${cat.name} (${cat.slug})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
