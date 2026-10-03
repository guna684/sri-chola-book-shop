import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import Category from './models/Category.js';
import User from './models/User.js';
import Order from './models/Order.js';
import PromoCode from './models/PromoCode.js';
import Banner from './models/Banner.js';
import Offer from './models/Offer.js';
import Message from './models/Message.js';
import Newsletter from './models/Newsletter.js';

dotenv.config({ path: './.env' });

const categoriesData = [
    { name: 'Tamil Literature', slug: 'tamil-literature', icon: '📜', description: 'Classic and modern Tamil literature, historical novels, and epics' },
    { name: 'Fiction', slug: 'fiction', icon: '📖', description: 'Fictional stories, bestselling contemporary and classic novels' },
    { name: 'Non-Fiction', slug: 'non-fiction', icon: '📚', description: 'Real-world topics, history, memoirs, and factual content' },
    { name: 'Mystery', slug: 'mystery', icon: '🔍', description: 'Gripping thrillers, crime investigations, and locked-room mysteries' },
    { name: 'Romance', slug: 'romance', icon: '💕', description: 'Romantic stories, heartwarming drama, and emotional journeys' },
    { name: 'Science Fiction', slug: 'sci-fi', icon: '🚀', description: 'Space exploration, futuristic tech, and speculative adventures' },
    { name: 'Self-Improvement', slug: 'self-improvement', icon: '✨', description: 'Personal development, habits, and mindset growth' },
    { name: 'Biography', slug: 'biography', icon: '👤', description: 'Inspirational life stories of visionary leaders and thinkers' },
    { name: "Children's", slug: 'childrens', icon: '🧸', description: 'Illustrated picture books and delightful stories for young readers' },
    { name: 'Agriculture', slug: 'agriculture', icon: '🌾', description: 'Farming sciences, organic agriculture, and traditional practices' },
    { name: 'Science', slug: 'science', icon: '🔬', description: 'Cosmology, physics, biology, and scientific breakthroughs' },
    { name: 'Self-Development', slug: 'self-development', icon: '🌱', description: 'Productivity, career mastery, and mental wellness' },
];

const sampleBooks = [
    // Tamil Literature
    {
        title: "Ponniyin Selvan - Part 1: Pudhu Vellam",
        title_ta: "பொன்னியின் செல்வன் - பாகம் 1: புது வெள்ளம்",
        author: "Kalki Krishnamurthy",
        author_ta: "கல்கி கிருஷ்ணமூர்த்தி",
        description: "The classic historical novel that tells the story of early days of Arulmozhivarman, who later became the great Chola emperor Rajaraja Chola I.",
        description_ta: "பிற்காலத்தில் புகழ்பெற்ற சோழ பேரரசர் ராஜராஜ சோழனாக மாறிய அருள்மொழிவர்மனின் ஆரம்ப நாட்களை விவரிக்கும் மகத்தான வரலாற்று நாவல்.",
        price: 299,
        originalPrice: 450,
        category: "Tamil Literature",
        category_ta: "தமிழ் இலக்கியம்",
        genre: "Historical Fiction",
        stock: 85,
        rating: 4.9,
        reviewCount: 3420,
        pages: 350,
        language: "Tamil",
        publishedDate: new Date("1950-01-01"),
        publisher: "Vikatan Prasuram",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 520,
        reviews: [
            {
                name: "Gunasekaran E",
                rating: 5,
                comment: "An absolute masterpiece of Tamil literature. Vandiyathevan's adventures keep you hooked from the first page!"
            },
            {
                name: "Anand Kumar",
                rating: 5,
                comment: "கல்கியின் எழுத்து நடை நம்மை சோழ சாம்ராஜ்யத்திற்கே நேரடியாக அழைத்துச் செல்கிறது. அருமையான புத்தகம்!"
            }
        ]
    },
    {
        title: "Ponniyin Selvan - Part 2: Suzhal Kaatru",
        title_ta: "பொன்னியின் செல்வன் - பாகம் 2: சுழற்காற்று",
        author: "Kalki Krishnamurthy",
        author_ta: "கல்கி கிருஷ்ணமூர்த்தி",
        description: "The second part of the historical masterpiece capturing the majestic Chola empire, politics, and power struggles.",
        description_ta: "சோழ சாம்ராஜ்யத்தின் கம்பீரம், அரசியல் சூழ்ச்சிகள் மற்றும் அதிகாரப் போட்டிகளை விவரிக்கும் வரலாற்று காவியத்தின் இரண்டாம் பாகம்.",
        price: 320,
        originalPrice: 480,
        category: "Tamil Literature",
        category_ta: "தமிழ் இலக்கியம்",
        genre: "Historical Fiction",
        stock: 70,
        rating: 4.9,
        reviewCount: 2890,
        pages: 360,
        language: "Tamil",
        publishedDate: new Date("1951-01-01"),
        publisher: "Vikatan Prasuram",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 410,
        reviews: [
            {
                name: "Priya Rajan",
                rating: 5,
                comment: "The suspense and intrigue build up wonderfully in part 2. Must-read for every history and literature enthusiast!"
            }
        ]
    },
    {
        title: "Sivagamiyin Sabatham",
        title_ta: "சிவகாமியின் சபதம்",
        author: "Kalki Krishnamurthy",
        author_ta: "கல்கி கிருஷ்ணமூர்த்தி",
        description: "A monumental historical romance and thriller set in the 7th-century Pallava and Chalukya empires.",
        description_ta: "ஏழாம் நூற்றாண்டு பல்லவ மற்றும் சாளுக்கிய சாம்ராஜ்யங்களின் பின்னணியில் உருவான உன்னதமான வரலாற்று நாவல்.",
        price: 380,
        originalPrice: 550,
        category: "Tamil Literature",
        category_ta: "தமிழ் இலக்கியம்",
        genre: "Historical Fiction",
        stock: 60,
        rating: 4.8,
        reviewCount: 1980,
        pages: 620,
        language: "Tamil",
        publishedDate: new Date("1948-01-01"),
        publisher: "Vanathi Pathipagam",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 310,
        reviews: [
            {
                name: "Vignesh C",
                rating: 5,
                comment: "Mamallapuram's sculptures and history come alive in this grand epic!"
            }
        ]
    },
    {
        title: "Parthiban Kanavu",
        title_ta: "பார்த்திபன் கனவு",
        author: "Kalki Krishnamurthy",
        author_ta: "கல்கி கிருஷ்ணமூர்த்தி",
        description: "The dream of Chola King Parthiban to restore the glory of the Chola dynasty under Pallava rule.",
        description_ta: "பல்லவர் ஆட்சியின் கீழ் வீழ்ந்த சோழ வம்சத்தின் புகழை மீண்டும் நிலைநாட்ட நினைக்கும் பார்த்திப சோழனின் உன்னத கனவு.",
        price: 199,
        originalPrice: 299,
        category: "Tamil Literature",
        category_ta: "தமிழ் இலக்கியம்",
        genre: "Historical Fiction",
        stock: 55,
        rating: 4.7,
        reviewCount: 1450,
        pages: 280,
        language: "Tamil",
        publishedDate: new Date("1941-01-01"),
        publisher: "Vikatan Prasuram",
        coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true,
        soldCount: 240
    },
    {
        title: "Tirukkural with Simple Explanation",
        title_ta: "திருக்குறள் எளிய உரை",
        author: "Thiruvalluvar / Mu. Varadarajan",
        author_ta: "திருவள்ளுவர் / மு. வரதராசனார்",
        description: "The masterwork of classical Tamil ethics covering Virtue, Wealth, and Love with clear modern commentary.",
        description_ta: "அறம், பொருள், இன்பம் ஆகிய முப்பாலையும் விளக்கும் உலகப் பொதுமறையான திருக்குறளின் எளிய தமிழ் உரை.",
        price: 250,
        originalPrice: 350,
        category: "Tamil Literature",
        category_ta: "தமிழ் இலக்கியம்",
        genre: "Philosophy",
        stock: 120,
        rating: 5.0,
        reviewCount: 4120,
        pages: 410,
        language: "Tamil",
        publishedDate: new Date("1960-01-01"),
        publisher: "Kazhagam",
        coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 650,
        reviews: [
            {
                name: "Senthil Nathan",
                rating: 5,
                comment: "ஒவ்வொரு வீட்டிலும் இருக்க வேண்டிய தமிழ் பொக்கிஷம். உரை மிக எளிமையாகவும் விளக்கமாகவும் உள்ளது."
            }
        ]
    },
    {
        title: "Silappadikaram: The Tale of an Anklet",
        title_ta: "சிலப்பதிகாரம்: கண்ணகியின் கதை",
        author: "Ilango Adigal",
        author_ta: "இளங்கோவடிகள்",
        description: "One of the Five Great Epics of ancient Tamil literature, recounting the tragic justice of Kannagi in Madurai.",
        description_ta: "தமிழின் ஐம்பெரும் காப்பியங்களில் ஒன்றான சிலப்பதிகாரம், கண்ணகியின் நீதி மற்றும் மதுரை நகரின் உன்னதத்தை விவரிக்கிறது.",
        price: 280,
        originalPrice: 399,
        category: "Tamil Literature",
        category_ta: "தமிழ் இலக்கியம்",
        genre: "Epic Poetry",
        stock: 65,
        rating: 4.9,
        reviewCount: 2200,
        pages: 320,
        language: "Tamil",
        publishedDate: new Date("1955-01-01"),
        publisher: "Saiva Siddhanta Works",
        coverImage: "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 390
    },

    // Self-Help & Personal Development
    {
        title: "Atomic Habits",
        title_ta: "அணு பழக்கங்கள்",
        author: "James Clear",
        author_ta: "ஜேம்ஸ் கிளியர்",
        description: "An easy and proven way to build good habits and break bad ones with tiny, powerful changes.",
        description_ta: "சிறு மாற்றங்கள் மூலம் நல்ல பழக்கங்களை வளர்த்து, கெட்ட பழக்கங்களை உடைக்கும் நிரூபிக்கப்பட்ட வழிகாட்டி.",
        price: 399,
        originalPrice: 599,
        category: "Self-Improvement",
        category_ta: "சுய முன்னேற்றம்",
        genre: "Personal Development",
        stock: 110,
        rating: 4.9,
        reviewCount: 5640,
        pages: 320,
        language: "English",
        publishedDate: new Date("2018-10-16"),
        publisher: "Penguin Random House",
        coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 920,
        reviews: [
            {
                name: "Gunasekaran E",
                rating: 5,
                comment: "This book transformed my daily routines and productivity. Small 1% improvements everyday really work!"
            },
            {
                name: "Kavitha S",
                rating: 5,
                comment: "Extremely practical and actionable advice. Loved the habit loop concepts!"
            }
        ]
    },
    {
        title: "The Psychology of Money",
        title_ta: "பணத்தின் உளவியல்",
        author: "Morgan Housel",
        author_ta: "மார்கன் ஹவுசல்",
        description: "Timeless lessons on wealth, greed, and happiness exploring how people actually think about money.",
        description_ta: "செல்வம், பேராசை மற்றும் மகிழ்ச்சி குறித்து மக்கள் எவ்வாறு சிந்திக்கிறார்கள் என்பதை விளக்கும் காலத்தால் அழியாத பாடங்கள்.",
        price: 349,
        originalPrice: 499,
        category: "Self-Improvement",
        category_ta: "சுய முன்னேற்றம்",
        genre: "Personal Finance",
        stock: 95,
        rating: 4.8,
        reviewCount: 3890,
        pages: 252,
        language: "English",
        publishedDate: new Date("2020-09-08"),
        publisher: "Harriman House",
        coverImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 780,
        reviews: [
            {
                name: "Dinesh Babu",
                rating: 5,
                comment: "Changed my perspective on investing and wealth accumulation completely. A must-read."
            }
        ]
    },
    {
        title: "Rich Dad Poor Dad",
        title_ta: "ரிச் டாட் புவர் டாட்",
        author: "Robert T. Kiyosaki",
        author_ta: "ராபர்ட் கியோசாகி",
        description: "What the rich teach their kids about money that the poor and middle class do not!",
        description_ta: "பணத்தைப் பற்றி பணக்காரர்கள் தங்கள் குழந்தைகளுக்கு கற்றுக்கொடுக்கும் ரகசியங்கள்.",
        price: 360,
        originalPrice: 499,
        category: "Self-Improvement",
        category_ta: "சுய முன்னேற்றம்",
        genre: "Personal Finance",
        stock: 90,
        rating: 4.8,
        reviewCount: 4890,
        pages: 336,
        language: "English",
        publishedDate: new Date("1997-04-01"),
        publisher: "Plata Publishing",
        coverImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 840
    },
    {
        title: "Ikigai: The Japanese Secret to a Long and Happy Life",
        title_ta: "இக்கிகாய்: நீண்ட மற்றும் மகிழ்ச்சியான வாழ்க்கை",
        author: "Héctor García and Francesc Miralles",
        author_ta: "ஹெக்டர் கார்சியா",
        description: "Find your purpose and passion through the gentle Japanese philosophy of Ikigai.",
        description_ta: "உங்கள் வாழ்க்கையின் நோக்கத்தையும் மகிழ்ச்சியையும் கண்டறிய உதவும் ஜப்பானிய தத்துவம்.",
        price: 299,
        originalPrice: 450,
        category: "Self-Improvement",
        category_ta: "சுய முன்னேற்றம்",
        genre: "Personal Growth",
        stock: 80,
        rating: 4.7,
        reviewCount: 3120,
        pages: 208,
        language: "English",
        publishedDate: new Date("2016-04-01"),
        publisher: "Penguin Life",
        coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true,
        soldCount: 460
    },

    // Fiction
    {
        title: "The Midnight Library",
        title_ta: "தி மிட்நைட் லைப்ரரி",
        author: "Matt Haig",
        author_ta: "மாட் ஹேக்",
        description: "Between life and death there is a library where every book gives you a chance to experience an alternate life.",
        description_ta: "வாழ்க்கைக்கும் மரணத்திற்கும் இடையில் ஒரு நூலகம் உள்ளது, அங்குள்ள ஒவ்வொரு புத்தகமும் மற்றொரு வாழ்க்கையை வாழ வாய்ப்பளிக்கிறது.",
        price: 449,
        originalPrice: 699,
        category: "Fiction",
        category_ta: "புனைகதை",
        genre: "Contemporary Fiction",
        stock: 65,
        rating: 4.6,
        reviewCount: 2840,
        pages: 304,
        language: "English",
        publishedDate: new Date("2020-08-13"),
        publisher: "Canongate Books",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 510
    },
    {
        title: "The Alchemist",
        title_ta: "தி அல்கெமிஸ்ட்",
        author: "Paulo Coelho",
        author_ta: "பாவ்லோ கொய்லோ",
        description: "A magical fable about following your dream and listening to your heart on the journey of life.",
        description_ta: "வாழ்க்கைப் பயணத்தில் உங்கள் கனவுகளைப் பின்தொடர்ந்து, இதயத்தின் குரலைக் கேட்கத் தூண்டும் மாயாஜால கதை.",
        price: 299,
        originalPrice: 399,
        category: "Fiction",
        category_ta: "புனைகதை",
        genre: "Philosophical Fiction",
        stock: 130,
        rating: 4.9,
        reviewCount: 7850,
        pages: 208,
        language: "English",
        publishedDate: new Date("1988-01-01"),
        publisher: "HarperOne",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 1100,
        reviews: [
            {
                name: "Rahul M",
                rating: 5,
                comment: "A soul-touching journey. 'When you want something, all the universe conspires in helping you to achieve it.'"
            }
        ]
    },

    // Mystery & Thriller
    {
        title: "The Silent Patient",
        title_ta: "தி சைலண்ட் பேஷண்ட்",
        author: "Alex Michaelides",
        author_ta: "அலெக்ஸ் மைக்கேலைட்ஸ்",
        description: "A shocking psychological thriller of a woman's act of violence against her husband and the therapist obsessed with uncovering her motive.",
        description_ta: "கணவனைச் சுட்டுக் கொன்றுவிட்டு மௌனமாக இருக்கும் பெண்ணும், அவளது காரணத்தைக் கண்டறியத் துடிக்கும் உளவியலாளரும் கொண்ட விறுவிறுப்பான கதை.",
        price: 349,
        originalPrice: 550,
        category: "Mystery",
        category_ta: "மர்மம் & திரில்லர்",
        genre: "Psychological Thriller",
        stock: 75,
        rating: 4.7,
        reviewCount: 3410,
        pages: 336,
        language: "English",
        publishedDate: new Date("2019-02-05"),
        publisher: "Celadon Books",
        coverImage: "https://images.unsplash.com/photo-1587876931567-564ce588bfbd?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 620
    },
    {
        title: "Sherlock Holmes: The Hound of the Baskervilles",
        title_ta: "ஷெர்லாக் ஹோம்ஸ்: பாஸ்கர்வில்லின் வேட்டை நாய்",
        author: "Sir Arthur Conan Doyle",
        author_ta: "சர் ஆர்தர் கோனன் டாயில்",
        description: "The classic locked-room and moorland mystery investigating a legendary hellhound terrifying a noble family.",
        description_ta: "மர்மமான வேட்டை நாய் குறித்த உலகப் புகழ்பெற்ற துப்பறியும் நாவல்.",
        price: 240,
        originalPrice: 350,
        category: "Mystery",
        category_ta: "மர்மம் & திரில்லர்",
        genre: "Detective Mystery",
        stock: 80,
        rating: 4.8,
        reviewCount: 3100,
        pages: 256,
        language: "English",
        publishedDate: new Date("1902-03-25"),
        publisher: "George Newnes",
        coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true,
        soldCount: 430
    },

    // Non-Fiction & Science
    {
        title: "Sapiens: A Brief History of Humankind",
        title_ta: "சேபியன்ஸ்: மனிதகுலத்தின் சுருக்கமான வரலாறு",
        author: "Yuval Noah Harari",
        author_ta: "யுவால் நோவா ஹராரி",
        description: "How an insignificant ape became the ruler of planet Earth, covering cognition, agriculture, and science.",
        description_ta: "ஒரு சாதாரண மனிதக் குரங்கு எவ்வாறு பூமிப் பந்தின் ஆளும் சக்தியாக மாறியது என்பதற்கான அறிவார்ந்த வரலாறு.",
        price: 499,
        originalPrice: 750,
        category: "Non-Fiction",
        category_ta: "அபுனைவு",
        genre: "History",
        stock: 90,
        rating: 4.9,
        reviewCount: 6200,
        pages: 464,
        language: "English",
        publishedDate: new Date("2014-09-04"),
        publisher: "Harper",
        coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 890
    },
    {
        title: "Thinking, Fast and Slow",
        title_ta: "சிந்தனை: வேகம் மற்றும் நிதானம்",
        author: "Daniel Kahneman",
        author_ta: "டேனியல் கான்மேன்",
        description: "Nobel laureate Daniel Kahneman explains the two systems that drive the way we think and make choices.",
        description_ta: "மனித சிந்தனையை வழிநடத்தும் இரு வகையான மூளை அமைப்புகளை விளக்கும் நோபல் பரிசு பெற்ற ஆய்வு நூல்.",
        price: 450,
        originalPrice: 650,
        category: "Non-Fiction",
        category_ta: "அபுனைவு",
        genre: "Psychology",
        stock: 70,
        rating: 4.8,
        reviewCount: 3950,
        pages: 499,
        language: "English",
        publishedDate: new Date("2011-10-25"),
        publisher: "Farrar, Straus and Giroux",
        coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true,
        soldCount: 520
    },
    {
        title: "A Brief History of Time",
        title_ta: "காலத்தின் ஒரு சுருக்கமான வரலாறு",
        author: "Stephen Hawking",
        author_ta: "ஸ்டீபன் ஹாக்கிங்",
        description: "From the Big Bang to black holes, exploring the greatest mysteries of space and time.",
        description_ta: "பெருவெடிப்பு முதல் கருந்துளைகள் வரை விண்வெளி மற்றும் காலத்தின் மாபெரும் மர்மங்களை விளக்கும் அறிவியல் நூல்.",
        price: 399,
        originalPrice: 599,
        category: "Science",
        category_ta: "அறிவியல்",
        genre: "Science",
        stock: 65,
        rating: 4.8,
        reviewCount: 2900,
        pages: 256,
        language: "English",
        publishedDate: new Date("1988-04-01"),
        publisher: "Bantam Books",
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true,
        soldCount: 380
    },

    // Biography
    {
        title: "Wings of Fire",
        title_ta: "அக்னிச் சிறகுகள்",
        author: "A.P.J. Abdul Kalam",
        author_ta: "ஏ.பி.ஜே. அப்துல் கலாம்",
        description: "The inspiring autobiography of Dr. A.P.J. Abdul Kalam, India's Missile Man and beloved President.",
        description_ta: "இந்தியாவின் ஏவுகணை மனிதரும், மக்களின் ஜனாதிபதியுமான டாக்டர் ஏ.பி.ஜே. அப்துல் கலாமின் உத்வேகமூட்டும் சுயசரிதை.",
        price: 249,
        originalPrice: 350,
        category: "Biography",
        category_ta: "சுயசரிதை",
        genre: "Autobiography",
        stock: 140,
        rating: 5.0,
        reviewCount: 8920,
        pages: 180,
        language: "English",
        publishedDate: new Date("1999-01-01"),
        publisher: "Universities Press",
        coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 1420,
        reviews: [
            {
                name: "Surya Prakash",
                rating: 5,
                comment: "A true beacon of inspiration for every Indian student and youth. Dream, dream, dream!"
            }
        ]
    },

    // Agriculture
    {
        title: "Nammazhvar's Organic Farming Principles",
        title_ta: "நம்மாழ்வாரின் இயற்கை வேளாண்மை தத்துவங்கள்",
        author: "G. Nammalvar",
        author_ta: "கோ. நம்மாழ்வார்",
        description: "Essential guide to traditional organic agriculture, soil regeneration, and sustainable crop cultivation.",
        description_ta: "மண் வளம் காத்தல், பாரம்பரிய விதைகள் மற்றும் நஞ்சில்லா இயற்கை வேளாண்மைக்கான வழிகாட்டி நூல்.",
        price: 220,
        originalPrice: 320,
        category: "Agriculture",
        category_ta: "வேளாண்மை",
        genre: "Agriculture",
        stock: 90,
        rating: 4.9,
        reviewCount: 1780,
        pages: 240,
        language: "Tamil",
        publishedDate: new Date("2010-06-15"),
        publisher: "Vikatan Prasuram",
        coverImage: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 450
    },

    // Children's
    {
        title: "Panchatantra Stories for Children",
        title_ta: "பஞ்சதந்திரக் கதைகள்",
        author: "Pandit Vishnu Sharma",
        author_ta: "விஷ்ணு சர்மா",
        description: "Timeless moral animal tales teaching wisdom, friendship, and practical intelligence to young minds.",
        description_ta: "சிறுவர்களுக்கு நற்பண்புகள், நட்பு மற்றும் புத்தி கூர்மையை கற்பிக்கும் பழங்கால நீதிக் கதைகள்.",
        price: 180,
        originalPrice: 250,
        category: "Children's",
        category_ta: "குழந்தைகள் நூல்கள்",
        genre: "Animal Story",
        stock: 100,
        rating: 4.8,
        reviewCount: 2150,
        pages: 160,
        language: "Tamil",
        publishedDate: new Date("2015-01-01"),
        publisher: "Giri Trading",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true,
        soldCount: 390
    },

    // Sci-Fi
    {
        title: "Dune",
        title_ta: "டியூன்",
        author: "Frank Herbert",
        author_ta: "பிராங்க் ஹெர்பர்ட்",
        description: "Set on the desert planet Arrakis, the epic tale of Paul Atreides and the most valuable substance in the cosmos.",
        description_ta: "பாலைவனக் கிரகமான அர்ராகிஸில் நடக்கும் பால் அட்ரைடிஸின் காவிய சாகச அறிவியல் நாவல்.",
        price: 499,
        originalPrice: 799,
        category: "Science Fiction",
        category_ta: "அறிவியல் புனைகதை",
        genre: "Science Fiction",
        stock: 60,
        rating: 4.8,
        reviewCount: 4510,
        pages: 688,
        language: "English",
        publishedDate: new Date("1965-08-01"),
        publisher: "Chilton Books",
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 680
    },

    // Romance
    {
        title: "Alai Osai",
        title_ta: "அலை ஓசை",
        author: "Kalki Krishnamurthy",
        author_ta: "கல்கி கிருஷ்ணமூர்த்தி",
        description: "Sahitya Akademi award-winning emotional novel capturing romance, social turmoil, and sacrifice during India's freedom struggle.",
        description_ta: "இந்திய விடுதலை போராட்ட பின்னணியில் காதல், தியாகம் மற்றும் சமூக மாற்றங்களை விவரிக்கும் சாகித்ய அகாடமி விருது பெற்ற நாவல்.",
        price: 360,
        originalPrice: 480,
        category: "Romance",
        category_ta: "காதல் நாவல்",
        genre: "Romantic Drama",
        stock: 55,
        rating: 4.8,
        reviewCount: 1670,
        pages: 512,
        language: "Tamil",
        publishedDate: new Date("1953-01-01"),
        publisher: "Vikatan Prasuram",
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 320
    },
    {
        title: "Pride and Prejudice",
        title_ta: "பிரைட் அண்ட் பிரெஜுடிஸ்",
        author: "Jane Austen",
        author_ta: "ஜேன் ஆஸ்டின்",
        description: "The timeless romantic masterpiece following the turbulent relationship between Elizabeth Bennet and Fitzwilliam Darcy.",
        description_ta: "எலிசபெத் பென்னட் மற்றும் ஃபிட்ஸ்வில்லியம் டார்சி இடையேயான உணர்ச்சிமிக்க காதல் கதை.",
        price: 249,
        originalPrice: 399,
        category: "Romance",
        category_ta: "காதல் நாவல்",
        genre: "Classic Romance",
        stock: 75,
        rating: 4.8,
        reviewCount: 5230,
        pages: 279,
        language: "English",
        publishedDate: new Date("1813-01-28"),
        publisher: "T. Egerton",
        coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true,
        soldCount: 410
    },

    // Self-Development
    {
        title: "Deep Work: Rules for Focused Success in a Distracted World",
        title_ta: "டீப் வொர்க்: ஆழ்ந்த கவனம்",
        author: "Cal Newport",
        author_ta: "கால் நியூபோர்ட்",
        description: "One of the most valuable skills in our economy: the ability to focus without distraction on a cognitively demanding task.",
        description_ta: "கவனச்சிதறல்கள் நிறைந்த உலகில் தீவிர கவனத்துடன் காரியங்களைச் சாதிக்கும் கலை.",
        price: 380,
        originalPrice: 550,
        category: "Self-Development",
        category_ta: "தனிமனித மேம்பாடு",
        genre: "Productivity",
        stock: 65,
        rating: 4.8,
        reviewCount: 3150,
        pages: 304,
        language: "English",
        publishedDate: new Date("2016-01-05"),
        publisher: "Grand Central Publishing",
        coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true,
        soldCount: 540
    }
];

const samplePromoCodes = [
    {
        code: 'WELCOME10',
        discountType: 'PERCENT',
        discountValue: 10,
        minCartValue: 299,
        maxDiscount: 100,
        usageLimit: 1000,
        perUserLimit: 1,
        expiryDate: new Date('2028-12-31'),
        active: true
    },
    {
        code: 'CHOLA20',
        discountType: 'PERCENT',
        discountValue: 20,
        minCartValue: 599,
        maxDiscount: 250,
        usageLimit: 500,
        perUserLimit: 1,
        expiryDate: new Date('2028-12-31'),
        active: true
    },
    {
        code: 'BOOKLOVER',
        discountType: 'FLAT',
        discountValue: 150,
        minCartValue: 899,
        usageLimit: 300,
        perUserLimit: 2,
        expiryDate: new Date('2028-12-31'),
        active: true
    }
];

const sampleOffers = [
    {
        code: 'CHOLA2026',
        discountPercentage: 20,
        expirationDate: new Date('2028-12-31'),
        isActive: true,
        description: 'New Year Special: Flat 20% discount on all Tamil classics & historical novels'
    },
    {
        code: 'TAMILFEST',
        discountPercentage: 15,
        expirationDate: new Date('2028-12-31'),
        isActive: true,
        description: 'Festival discount on Ponniyin Selvan and Sangam literature'
    },
    {
        code: 'READERPASS',
        discountPercentage: 25,
        expirationDate: new Date('2028-12-31'),
        isActive: true,
        description: 'Special club member discount across bestselling books'
    }
];

const sampleMessages = [
    {
        name: "Gunasekaran E",
        email: "ggx9390@gmail.com",
        subject: "Ponniyin Selvan Hardcover Box Set",
        message: "Hello Sri Chola Team, do you have the collector hardcover edition of Ponniyin Selvan all 5 parts in a single box set? Would love to buy it as a gift.",
        isRead: false
    },
    {
        name: "Anitha Murugan",
        email: "anitha.m@gmail.com",
        subject: "Book Recommendations for High School",
        message: "Hi, I am looking for classical Tamil historical novels suitable for 10th-grade students. Could you recommend a starter list similar to Parthiban Kanavu?",
        isRead: true
    },
    {
        name: "Karthik R",
        email: "karthik.reads@outlook.com",
        subject: "Corporate Bulk Order Inquiry",
        message: "We want to place a bulk order of 25 copies of Atomic Habits and Wings of Fire for our company library in Chennai. Do you offer institutional discounts?",
        isRead: false
    },
    {
        name: "Meenakshi Sundaram",
        email: "meena.sundaram@gmail.com",
        subject: "Delighted with Fast Delivery to Thanjavur!",
        message: "Just received my order in Thanjavur within 2 business days. The packaging was immaculate and book quality is top tier. Thank you Sri Chola team!",
        isRead: true
    }
];

const sampleNewsletters = [
    { email: 'gunasekaran.reader@gmail.com' },
    { email: 'tamil.literature.club@outlook.com' },
    { email: 'chola.books.lover@gmail.com' },
    { email: 'senthil.books@yahoo.com' }
];

async function seedMasterData() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await connectDB();
        console.log('✅ Connected to MongoDB Atlas');

        // 1. Seed Categories
        console.log('\n📂 Seeding Categories...');
        for (const cat of categoriesData) {
            await Category.findOneAndUpdate(
                { slug: cat.slug },
                { $set: cat },
                { upsert: true, new: true }
            );
        }
        console.log(`✅ ${categoriesData.length} Categories seeded/updated`);

        // 2. Seed Books
        console.log('\n📚 Seeding Books...');
        const seededBooks = [];
        for (const bookData of sampleBooks) {
            const book = await Book.findOneAndUpdate(
                { title: bookData.title },
                { $set: bookData },
                { upsert: true, new: true }
            );
            seededBooks.push(book);
        }
        console.log(`✅ ${seededBooks.length} Books seeded/updated successfully`);

        // Clean any leftover dummy books if any
        await Book.deleteMany({ title: 'Sample name' });

        // Update book counts per category
        for (const cat of categoriesData) {
            const count = await Book.countDocuments({ category: cat.name });
            await Category.updateOne({ slug: cat.slug }, { $set: { bookCount: Math.max(count, 15) } });
        }
        console.log('✅ Category book counts updated');

        // 3. Seed Promo Codes
        console.log('\n🎟️ Seeding Promo Codes...');
        for (const promo of samplePromoCodes) {
            await PromoCode.findOneAndUpdate(
                { code: promo.code },
                { $set: promo },
                { upsert: true, new: true }
            );
        }
        console.log(`✅ ${samplePromoCodes.length} Promo Codes seeded/updated`);

        // 4. Seed Offers
        console.log('\n🏷️ Seeding Offers...');
        for (const offer of sampleOffers) {
            await Offer.findOneAndUpdate(
                { code: offer.code },
                { $set: offer },
                { upsert: true, new: true }
            );
        }
        console.log(`✅ ${sampleOffers.length} Offers seeded/updated`);

        // 5. Seed Banner
        console.log('\n🎨 Seeding Hero Banner...');
        const existingBanner = await Banner.findOne();
        const bannerPayload = {
            title: 'Welcome to Sri Chola Book Shop',
            subtitle: 'Discover timeless Tamil literature, bestselling fiction, wisdom, and personal growth books delivered directly to your doorstep.',
            imageUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be8860ee?w=1600&h=800&fit=crop',
            overlayOpacity: 0.25,
            buttons: [
                { text: 'Explore Books', link: '/books', variant: 'primary', order: 1, isVisible: true },
                { text: 'View Categories', link: '/categories', variant: 'outline', order: 2, isVisible: true }
            ],
            counters: [
                { label: 'Books Available', value: '1,000', suffix: '+', isVisible: true },
                { label: 'Renowned Authors', value: '50', suffix: '+', isVisible: true },
                { label: 'Happy Readers', value: '10,000', suffix: '+', isVisible: true }
            ],
            isActive: true
        };

        if (!existingBanner) {
            await Banner.create(bannerPayload);
            console.log('✅ Default Hero Banner created');
        } else {
            await Banner.findByIdAndUpdate(existingBanner._id, { $set: bannerPayload });
            console.log('✅ Hero Banner updated');
        }

        // 6. Seed Customer Messages
        console.log('\n💬 Seeding Customer Messages...');
        for (const msg of sampleMessages) {
            await Message.findOneAndUpdate(
                { email: msg.email, subject: msg.subject },
                { $set: msg },
                { upsert: true, new: true }
            );
        }
        console.log(`✅ ${sampleMessages.length} Messages seeded/updated`);

        // 7. Seed Newsletter Subscribers
        console.log('\n📬 Seeding Newsletter Subscribers...');
        for (const sub of sampleNewsletters) {
            await Newsletter.findOneAndUpdate(
                { email: sub.email },
                { $set: sub },
                { upsert: true, new: true }
            );
        }
        console.log(`✅ ${sampleNewsletters.length} Newsletter Subscribers seeded/updated`);

        // 8. Seed Sample Orders for customer user
        console.log('\n📦 Seeding Sample Orders for Analytics & Dashboard...');
        const customer = await User.findOne({ isAdmin: false });
        if (!customer) {
            console.log('⚠️ No customer user found for sample orders. Skipping orders.');
        } else {
            const existingOrdersCount = await Order.countDocuments();
            if (existingOrdersCount >= 10) {
                console.log(`ℹ️ Database already has ${existingOrdersCount} orders. Keeping existing orders.`);
            } else {
                const sampleOrders = [];
                const statuses = ['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Processing'];
                const paymentMethods = ['Razorpay (Prepaid)', 'Razorpay (Prepaid)', 'Cash on Delivery'];
                const cities = ['Chennai', 'Thanjavur', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'];

                const now = new Date();

                for (let i = 0; i < 20; i++) {
                    const daysAgo = Math.floor(Math.random() * 60) + 1; // within last 60 days
                    const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

                    // Pick 1 to 3 random books
                    const itemCount = Math.floor(Math.random() * 3) + 1;
                    const items = [];
                    let itemsPrice = 0;

                    for (let j = 0; j < itemCount; j++) {
                        const randomBook = seededBooks[Math.floor(Math.random() * seededBooks.length)];
                        const qty = Math.floor(Math.random() * 2) + 1;
                        items.push({
                            title: randomBook.title,
                            qty: qty,
                            image: randomBook.coverImage,
                            price: randomBook.price,
                            product: randomBook._id
                        });
                        itemsPrice += randomBook.price * qty;
                    }

                    const shippingPrice = itemsPrice >= 500 ? 0 : 40;
                    const totalPrice = itemsPrice + shippingPrice;
                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
                    const isPaid = method !== 'Cash on Delivery' || status === 'Delivered';
                    const city = cities[Math.floor(Math.random() * cities.length)];

                    sampleOrders.push({
                        user: customer._id,
                        orderItems: items,
                        shippingAddress: {
                            address: `${Math.floor(Math.random() * 80) + 1}, Raja Raja Cholan Salai`,
                            city: city,
                            postalCode: `6${Math.floor(10000 + Math.random() * 90000)}`,
                            country: 'India',
                            deliveryContactNumber: '9876543210'
                        },
                        paymentMethod: method,
                        paymentResult: isPaid ? {
                            id: `pay_sample_${Math.floor(100000 + Math.random() * 900000)}`,
                            status: 'COMPLETED',
                            update_time: orderDate.toISOString()
                        } : undefined,
                        itemsPrice: itemsPrice,
                        shippingPrice: shippingPrice,
                        totalPrice: totalPrice,
                        isPaid: isPaid,
                        paidAt: isPaid ? orderDate : undefined,
                        isDelivered: status === 'Delivered',
                        deliveredAt: status === 'Delivered' ? new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000) : undefined,
                        status: status,
                        createdAt: orderDate,
                        updatedAt: orderDate
                    });
                }

                await Order.insertMany(sampleOrders);
                console.log(`✅ 20 Sample Orders created across the last 60 days!`);
            }
        }

        // Summary
        console.log('\n=======================================');
        console.log('🎉 DATABASE SEEDING COMPLETED!');
        console.log('=======================================');
        console.log(`Total Categories in DB: ${await Category.countDocuments()}`);
        console.log(`Total Books in DB:      ${await Book.countDocuments()}`);
        console.log(`Total Promo Codes in DB:${await PromoCode.countDocuments()}`);
        console.log(`Total Offers in DB:     ${await Offer.countDocuments()}`);
        console.log(`Total Banners in DB:    ${await Banner.countDocuments()}`);
        console.log(`Total Messages in DB:   ${await Message.countDocuments()}`);
        console.log(`Total Newsletters in DB:${await Newsletter.countDocuments()}`);
        console.log(`Total Orders in DB:     ${await Order.countDocuments()}`);
        console.log(`Total Users in DB:      ${await User.countDocuments()}`);
        console.log('=======================================\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
}

seedMasterData();
