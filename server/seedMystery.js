import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config({ path: './server/.env' });
connectDB();

const mysteryBooks = [
    {
        title: "The Girl on the Train",
        author: "Paula Hawkins",
        description: "Rachel catches the same commuter train every morning. She knows it will wait at the same signal each time, overlooking a row of back gardens. She’s even started to feel like she knows the people who live in one of the houses. 'Jess and Jason', she calls them. Their life—as she sees it—is perfect. If only Rachel could be that happy. And then she sees something shocking.",
        price: 399,
        category: "Mystery",
        genre: "Psychological Thriller",
        stock: 50,
        isbn: "978-1594634024",
        pages: 336,
        language: "English",
        publishedDate: "2015-01-13",
        coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true
    },
    {
        title: "Gone Girl",
        author: "Gillian Flynn",
        description: "On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne’s fifth wedding anniversary. Presents are being wrapped and reservations are being made when Nick’s clever and beautiful wife disappears from their rented McMansion on the Mississippi River.",
        price: 349,
        category: "Mystery",
        genre: "Psychological Thriller",
        stock: 40,
        isbn: "978-0307588371",
        pages: 432,
        language: "English",
        publishedDate: "2012-05-24",
        coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true
    },
    {
        title: "The Woman in the Window",
        author: "A.J. Finn",
        description: "Anna Fox lives alone—a recluse in her New York City home, unable to venture outside. She spends her day drinking wine (maybe too much), watching old movies, recalling happier times . . . and spying on her neighbors.",
        price: 379,
        category: "Mystery",
        genre: "Psychological Thriller",
        stock: 35,
        isbn: "978-0062678416",
        pages: 448,
        language: "English",
        publishedDate: "2018-01-02",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        featured: true,
        bestseller: false
    },
    {
        title: "Sharp Objects",
        author: "Gillian Flynn",
        description: "Fresh from a brief stay at a psych hospital, reporter Camille Preaker faces a troubling assignment: she must return to her tiny hometown to cover the murders of two preteen girls.",
        price: 329,
        category: "Mystery",
        genre: "Gothic Mystery",
        stock: 45,
        isbn: "978-0307341556",
        pages: 254,
        language: "English",
        publishedDate: "2006-09-26",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true
    },
    {
        title: "The Guest List",
        author: "Lucy Foley",
        description: "A wedding celebration turns dark and deadly in this deliciously wicked and atmospheric thriller reminiscent of Agatha Christie.",
        price: 425,
        category: "Mystery",
        genre: "Locked Room Mystery",
        stock: 60,
        isbn: "978-0062868671",
        pages: 320,
        language: "English",
        publishedDate: "2020-02-20",
        coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true
    },
    {
        title: "The Hunting Party",
        author: "Lucy Foley",
        description: "Everyone's invited. Everyone's a suspect. And everyone's got a secret. Even the friend you've known for years.",
        price: 399,
        category: "Mystery",
        genre: "Locked Room Mystery",
        stock: 30,
        isbn: "978-0008297114",
        pages: 368,
        language: "English",
        publishedDate: "2018-12-03",
        coverImage: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=600&fit=crop",
        featured: false,
        bestseller: false
    },
    {
        title: "Verity",
        author: "Colleen Hoover",
        description: "Lowen Ashleigh is a struggling writer on the brink of financial ruin when she accepts the job offer of a lifetime. Jeremy Crawford, husband of bestselling author Verity Crawford, has hired Lowen to complete the remaining books in a successful series his injured wife is unable to finish.",
        price: 349,
        category: "Mystery",
        genre: "Psychological Thriller",
        stock: 75,
        isbn: "978-1542030595",
        pages: 336,
        language: "English",
        publishedDate: "2018-12-07",
        coverImage: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true
    },
    {
        title: "The 7 1/2 Deaths of Evelyn Hardcastle",
        author: "Stuart Turton",
        description: "Aiden Bishop knows the rules. Evelyn Hardcastle will die every day until he can identify her killer and break the cycle. But every time the day begins again, Aiden wakes up in the body of a different guest at Blackheath Manor.",
        price: 499,
        category: "Mystery",
        genre: "High-Concept Mystery",
        stock: 25,
        isbn: "978-1492657965",
        pages: 432,
        language: "English",
        publishedDate: "2018-02-08",
        coverImage: "https://images.unsplash.com/photo-1614544048536-0d28caf77f41?w=400&h=600&fit=crop",
        featured: true,
        bestseller: false
    },
    {
        title: "The Maidens",
        author: "Alex Michaelides",
        description: "Edward Fosca is a murderer. Of this Mariana is certain. But Fosca is untouchable. A handsome and charismatic Greek Tragedy professor at Cambridge University, Fosca is adored by staff and students alike—particularly by the members of a secret society of female students known as The Maidens.",
        price: 449,
        category: "Mystery",
        genre: "Psychological Thriller",
        stock: 55,
        isbn: "978-1250304452",
        pages: 352,
        language: "English",
        publishedDate: "2021-06-15",
        coverImage: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true
    },
    {
        title: "One by One",
        author: "Ruth Ware",
        description: "An off-site week in a French chalet in the French Alps. Ten corporate co-workers. One avalanche. And a killer who starts picking them off, one by one.",
        price: 389,
        category: "Mystery",
        genre: "Locked Room Mystery",
        stock: 40,
        isbn: "978-1501160837",
        pages: 384,
        language: "English",
        publishedDate: "2020-09-08",
        coverImage: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400&h=600&fit=crop",
        featured: true,
        bestseller: false
    },
    {
        title: "The Shadow of the Wind",
        author: "Carlos Ruiz Zafón",
        description: "Barcelona, 1945: A city slowly heals in the aftermath of the Spanish Civil War, and Daniel, an antiquarian book dealer’s son who mourns the loss of his mother, finds solace in a mysterious book entitled The Shadow of the Wind, by one Julián Carax.",
        price: 599,
        category: "Mystery",
        genre: "Gothic Mystery",
        stock: 20,
        isbn: "978-0143034902",
        pages: 487,
        language: "English",
        publishedDate: "2004-04-12",
        coverImage: "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true
    },
    {
        title: "In the Woods",
        author: "Tana French",
        description: "As dusk approaches a small Dublin suburb in the summer of 1984, mothers begin to call their children home. But on this warm evening, three children do not return from the dark and silent woods. When the police arrive, they find only one of the children gripping a tree trunk in terror, wearing blood-filled sneakers, and unable to recall a single detail of the previous hours.",
        price: 369,
        category: "Mystery",
        genre: "Police Procedural",
        stock: 35,
        isbn: "978-0143113492",
        pages: 429,
        language: "English",
        publishedDate: "2007-05-30",
        coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop",
        featured: false,
        bestseller: false
    },
    {
        title: "The Thirteenth Tale",
        author: "Diane Setterfield",
        description: "Vida Winter, a famous novelist whose life and origins are shrouded in mystery, is now very old and ill. She has spent her life inventing stories about her past, and now she finally wants to tell the truth.",
        price: 415,
        category: "Mystery",
        genre: "Gothic Mystery",
        stock: 15,
        isbn: "978-0743298025",
        pages: 406,
        language: "English",
        publishedDate: "2006-09-12",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        featured: false,
        bestseller: true
    },
    {
        title: "The Alienist",
        author: "Caleb Carr",
        description: "The year is 1896. The city is New York. Newspaper reporter John Schuyler Moore is summoned by his friend Dr. Laszlo Kreizler—a psychologist, or 'alienist'—to view the horribly mutilated body of an adolescent boy abandoned on the unfinished Williamsburg Bridge.",
        price: 479,
        category: "Mystery",
        genre: "Historical Mystery",
        stock: 25,
        isbn: "978-0679417798",
        pages: 496,
        language: "English",
        publishedDate: "1994-03-29",
        coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
        featured: true,
        bestseller: false
    },
    {
        title: "The Devotion of Suspect X",
        author: "Keigo Higashino",
        description: "Yasuko Hanaoka is a divorced, single mother who thought she had finally escaped her abusive ex-husband TOGASHI. When he shows up one day to extort money from her, threatening both her and her daughter Misato, the situation quickly escalates into violence and Togashi ends up dead.",
        price: 359,
        category: "Mystery",
        genre: "Honkaku Mystery",
        stock: 45,
        isbn: "978-0312375065",
        pages: 298,
        language: "English",
        publishedDate: "2005-08-01",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
        featured: true,
        bestseller: true
    }
];

const seedMystery = async () => {
    try {
        console.log('Seeding 15 new Mystery books...');
        await Book.insertMany(mysteryBooks);
        console.log('Successfully seeded 15 mystery books!');
        process.exit();
    } catch (error) {
        console.error('Error seeding mystery books:', error);
        process.exit(1);
    }
};

seedMystery();
