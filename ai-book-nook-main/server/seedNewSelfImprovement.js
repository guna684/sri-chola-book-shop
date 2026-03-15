import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config({ path: './server/.env' });
connectDB();

// High quality unsplash placeholders matching self-improvement themes
const placeholderImages = [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f", // books
    "https://images.unsplash.com/photo-1512820790803-83ca734da794", // nature book
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8", // workspace
    "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6", // reading
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353", // vintage books
    "https://images.unsplash.com/photo-1476275466078-4007374efac4", // path
    "https://images.unsplash.com/photo-1505664194779-8beaceb93744", // lightbulb
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643", // typewriter
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173", // notebook
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", // friends/people
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d", // connection
    "https://images.unsplash.com/photo-1490730141103-6cac27aaab94", // sunset/horizon
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // beach/peace
    "https://images.unsplash.com/photo-1519681393784-d120267933ba", // mountains
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e"  // exploring
];

function getRandomImage() {
    return placeholderImages[Math.floor(Math.random() * placeholderImages.length)] + "?auto=format&fit=crop&w=600&q=80";
}

const newSelfImprovementBooks = [
    {
        title: "Life is an Opportunity",
        author: "A. Rajmohan I.P.S.",
        description: "A motivational guide on defining purpose and seizing life's opportunities effectively.",
        price: 299,
        category: "Self-Improvement",
        genre: "Motivation",
        stock: 100,
        isbn: "9780000000001",
        pages: 200,
        language: "English",
        publishedDate: "2020-01-01",
        coverImage: getRandomImage(),
        image_url: getRandomImage(),
        featured: true,
        bestseller: false
    },
    {
        title: "In the Race Called Life",
        author: "V. Irai Anbu I.A.S.",
        description: "Insights on navigating the challenges of life with resilience and an unwavering spirit.",
        price: 350,
        category: "Self-Improvement",
        genre: "Personal Growth",
        stock: 120,
        isbn: "9780000000002",
        pages: 250,
        language: "English",
        publishedDate: "2018-05-15",
        coverImage: getRandomImage(),
        image_url: getRandomImage(),
        featured: true,
        bestseller: true
    },
    {
        title: "Life Itself is a Ritual",
        author: "V. Irai Anbu I.A.S.",
        description: "An exploration of finding meaning and discipline in everyday actions.",
        price: 320,
        category: "Self-Improvement",
        genre: "Philosophy",
        stock: 80,
        isbn: "9780000000003",
        pages: 210,
        language: "English",
        publishedDate: "2019-11-20",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Small Small Minnow-Fish",
        author: "V. Irai Anbu I.A.S.",
        description: "Reflections on finding significant lessons in small and often overlooked things.",
        price: 280,
        category: "Self-Improvement",
        genre: "Inspirational",
        stock: 150,
        isbn: "9780000000004",
        pages: 180,
        language: "English",
        publishedDate: "2021-03-10",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "The Common Man",
        author: "V. Irai Anbu I.A.S.",
        description: "Empowering thoughts dedicated to the everyday struggles and triumphs of the common man.",
        price: 310,
        category: "Self-Improvement",
        genre: "Motivation",
        stock: 130,
        isbn: "9780000000005",
        pages: 220,
        language: "English",
        publishedDate: "2017-08-05",
        coverImage: getRandomImage(),
        image_url: getRandomImage(),
        bestseller: true
    },
    {
        title: "The Turning Point",
        author: "V. Irai Anbu I.A.S.",
        description: "Stories of pivotal moments that can change one's trajectory toward success.",
        price: 340,
        category: "Self-Improvement",
        genre: "Success",
        stock: 140,
        isbn: "9780000000006",
        pages: 240,
        language: "English",
        publishedDate: "2022-02-14",
        coverImage: getRandomImage(),
        image_url: getRandomImage(),
        featured: true
    },
    {
        title: "Let the Soul Touch... and Blossom...",
        author: "V. Irai Anbu I.A.S.",
        description: "A profound journey into discovering one's soul and realizing inner potential.",
        price: 360,
        category: "Self-Improvement",
        genre: "Spirituality",
        stock: 110,
        isbn: "9780000000007",
        pages: 280,
        language: "English",
        publishedDate: "2016-12-01",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Insights (Short Stories)",
        author: "V. Irai Anbu I.A.S.",
        description: "A collection of short stories packed with wisdom and life lessons.",
        price: 275,
        category: "Self-Improvement",
        genre: "Short Stories",
        stock: 160,
        isbn: "9780000000008",
        pages: 190,
        language: "English",
        publishedDate: "2015-09-30",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Flying Fish (Poetry)",
        author: "V. Irai Anbu I.A.S.",
        description: "Inspirational poetry reflecting on the boundlessness of human ambition.",
        price: 250,
        category: "Self-Improvement",
        genre: "Poetry",
        stock: 90,
        isbn: "9780000000009",
        pages: 150,
        language: "English",
        publishedDate: "2014-06-15",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Saffron (Poetry)",
        author: "V. Irai Anbu I.A.S.",
        description: "Verses exploring themes of purity, dedication, and the bright side of life.",
        price: 250,
        category: "Self-Improvement",
        genre: "Poetry",
        stock: 95,
        isbn: "9780000000010",
        pages: 150,
        language: "English",
        publishedDate: "2014-06-16",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "The First Generation",
        author: "V. Irai Anbu I.A.S.",
        description: "A tribute and guide for first-generation learners and achievers.",
        price: 330,
        category: "Self-Improvement",
        genre: "Motivation",
        stock: 125,
        isbn: "9780000000011",
        pages: 230,
        language: "English",
        publishedDate: "2019-01-20",
        coverImage: getRandomImage(),
        image_url: getRandomImage(),
        bestseller: true
    },
    {
        title: "Let Us Rise Through Hard Work",
        author: "V. Irai Anbu I.A.S.",
        description: "A manual on the dignity of labor and achieving dreams through relentless effort.",
        price: 299,
        category: "Self-Improvement",
        genre: "Success",
        stock: 145,
        isbn: "9780000000012",
        pages: 205,
        language: "English",
        publishedDate: "2018-11-11",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Starting From Within",
        author: "V. Irai Anbu I.A.S.",
        description: "Focusing on internal change as the catalyst for external success.",
        price: 310,
        category: "Self-Improvement",
        genre: "Personal Growth",
        stock: 135,
        isbn: "9780000000013",
        pages: 215,
        language: "English",
        publishedDate: "2020-07-07",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "The Encounter and the Mystery",
        author: "V. Irai Anbu I.A.S.",
        description: "Delving into the mysteries of existence and meaningful human encounters.",
        price: 345,
        category: "Self-Improvement",
        genre: "Philosophy",
        stock: 115,
        isbn: "9780000000014",
        pages: 260,
        language: "English",
        publishedDate: "2021-09-09",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Dear Student",
        author: "V. Irai Anbu I.A.S.",
        description: "Essential advice and motivational letters directed at students aiming for excellence.",
        price: 280,
        category: "Self-Improvement",
        genre: "Education",
        stock: 200,
        isbn: "9780000000015",
        pages: 185,
        language: "English",
        publishedDate: "2017-06-01",
        coverImage: getRandomImage(),
        image_url: getRandomImage(),
        featured: true,
        bestseller: true
    },
    {
        title: "Thiruvempavai (With Explanations)",
        author: "V. Irai Anbu I.A.S.",
        description: "A modern interpretation and explanation of the classical devotional verses.",
        price: 390,
        category: "Self-Improvement",
        genre: "Spirituality",
        stock: 75,
        isbn: "9780000000016",
        pages: 310,
        language: "English",
        publishedDate: "2013-12-01",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Sithu the Sparrow",
        author: "V. Irai Anbu I.A.S.",
        description: "An allegorical tale about freedom, perspective, and finding joy.",
        price: 260,
        category: "Self-Improvement",
        genre: "Inspirational",
        stock: 155,
        isbn: "9780000000017",
        pages: 170,
        language: "English",
        publishedDate: "2016-04-10",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Vision",
        author: "V. Irai Anbu I.A.S.",
        description: "A comprehensive guide on establishing and pursuing a forward-looking life vision.",
        price: 320,
        category: "Self-Improvement",
        genre: "Success",
        stock: 125,
        isbn: "9780000000018",
        pages: 220,
        language: "English",
        publishedDate: "2019-08-15",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "A Message to the Youth",
        author: "V. Irai Anbu I.A.S.",
        description: "Direct, powerful advice intended to guide the next generation.",
        price: 290,
        category: "Self-Improvement",
        genre: "Motivation",
        stock: 180,
        isbn: "9780000000019",
        pages: 195,
        language: "English",
        publishedDate: "2018-01-12",
        coverImage: getRandomImage(),
        image_url: getRandomImage(),
        bestseller: true
    },
    {
        title: "Dharma",
        author: "V. Irai Anbu I.A.S.",
        description: "An exploration of duty, righteousness, and ethical living in modern times.",
        price: 350,
        category: "Self-Improvement",
        genre: "Philosophy",
        stock: 105,
        isbn: "9780000000020",
        pages: 250,
        language: "English",
        publishedDate: "2020-10-10",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Nature",
        author: "V. Irai Anbu I.A.S.",
        description: "Reflections on the restorative and teaching powers of the natural world.",
        price: 300,
        category: "Self-Improvement",
        genre: "Inspirational",
        stock: 130,
        isbn: "9780000000021",
        pages: 200,
        language: "English",
        publishedDate: "2021-05-22",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Friendship",
        author: "V. Irai Anbu I.A.S.",
        description: "A deep dive into the value of companionship and building lasting relationships.",
        price: 299,
        category: "Self-Improvement",
        genre: "Personal Growth",
        stock: 140,
        isbn: "9780000000022",
        pages: 210,
        language: "English",
        publishedDate: "2019-02-14",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Flowers",
        author: "V. Irai Anbu I.A.S.",
        description: "Metaphorical writings about growth, beauty, and resilience in adversity.",
        price: 280,
        category: "Self-Improvement",
        genre: "Inspirational",
        stock: 110,
        isbn: "9780000000023",
        pages: 180,
        language: "English",
        publishedDate: "2017-03-20",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Maturity",
        author: "V. Irai Anbu I.A.S.",
        description: "Insights into emotional intelligence and growing wise with life experiences.",
        price: 330,
        category: "Self-Improvement",
        genre: "Psychology",
        stock: 125,
        isbn: "9780000000024",
        pages: 235,
        language: "English",
        publishedDate: "2022-07-01",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    },
    {
        title: "Love",
        author: "V. Irai Anbu I.A.S.",
        description: "A thoughtful examination of love in its many forms and its impact on the human spirit.",
        price: 310,
        category: "Self-Improvement",
        genre: "Personal Growth",
        stock: 145,
        isbn: "9780000000025",
        pages: 220,
        language: "English",
        publishedDate: "2023-02-14",
        coverImage: getRandomImage(),
        image_url: getRandomImage()
    }
];

const seedNewSelfImprovement = async () => {
    try {
        console.log(`Seeding ${newSelfImprovementBooks.length} new Self-Improvement books...`);
        const result = await Book.insertMany(newSelfImprovementBooks);
        console.log(`Successfully seeded ${result.length} new self-improvement books!`);
        process.exit();
    } catch (error) {
        console.error('Error seeding new self-improvement books:', error);
        process.exit(1);
    }
};

seedNewSelfImprovement();
