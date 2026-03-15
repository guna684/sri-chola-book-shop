import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Book from './models/Book.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Mapping of book title -> AI-generated image filename (in brain dir) OR Google Books API URL
const coverMap = {
  // AI-Generated covers (copy these files to uploads)
  "Wings of Fire": { type: "file", src: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\13207780-e0ba-4b4d-8e48-0e3919235d27\\wings_of_fire_cover_1773225261474.png" },
  "The Diary of a Young Girl": { type: "file", src: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\13207780-e0ba-4b4d-8e48-0e3919235d27\\diary_young_girl_cover_1773225277519.png" },
  "Long Walk to Freedom": { type: "file", src: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\13207780-e0ba-4b4d-8e48-0e3919235d27\\long_walk_freedom_cover_1773225446975.png" },
  "Einstein: His Life and Universe": { type: "file", src: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\13207780-e0ba-4b4d-8e48-0e3919235d27\\einstein_cover_1773225475274.png" },
  "Elon Musk": { type: "file", src: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\13207780-e0ba-4b4d-8e48-0e3919235d27\\elon_musk_cover_1773225499547.png" },
  "India After Gandhi": { type: "file", src: "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\13207780-e0ba-4b4d-8e48-0e3919235d27\\india_after_gandhi_cover_1773225515836.png" },

  // Google Books API URLs for remaining books (reliable CDN)
  "The Discovery of India": { type: "url", src: "https://books.google.com/books/content?id=K1MEAAAAMBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "A People's History of the United States": { type: "url", src: "https://books.google.com/books/content?id=7BGOPgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "The Universe in a Nutshell": { type: "url", src: "https://books.google.com/books/content?id=UkPgAAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "Pale Blue Dot": { type: "url", src: "https://books.google.com/books/content?id=8H0zQAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "A Short History of Nearly Everything": { type: "url", src: "https://books.google.com/books/content?id=nN_SAAAAIAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "Chaos": { type: "url", src: "https://books.google.com/books/content?id=JyGEkGwkWgEC&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "The Structure of Scientific Revolutions": { type: "url", src: "https://books.google.com/books/content?id=3eP5Y_OOuzwC&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "The 7 Habits of Highly Effective People": { type: "url", src: "https://books.google.com/books/content?id=upUxaNWSaRIC&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "Think and Grow Rich": { type: "url", src: "https://books.google.com/books/content?id=YXllAAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "The Monk Who Sold His Ferrari": { type: "url", src: "https://books.google.com/books/content?id=4d6nAAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "The Miracle Morning": { type: "url", src: "https://books.google.com/books/content?id=yhU0BQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "The One Thing": { type: "url", src: "https://books.google.com/books/content?id=2VPslAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
  "The Compound Effect": { type: "url", src: "https://books.google.com/books/content?id=Qy9uPgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" },
};

const uploadsDir = path.join(__dirname, 'uploads', 'book-covers');

const run = async () => {
  await connectDB();

  // Ensure uploads dir exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  let updated = 0;

  for (const [title, coverInfo] of Object.entries(coverMap)) {
    const book = await Book.findOne({ title });
    if (!book) {
      console.log(`⚠️  Book not found: ${title}`);
      continue;
    }

    if (coverInfo.type === 'file') {
      // Copy the AI-generated image to uploads folder
      const ext = path.extname(coverInfo.src);
      const destFilename = `ai_cover_${book._id}${ext}`;
      const destPath = path.join(uploadsDir, destFilename);

      try {
        fs.copyFileSync(coverInfo.src, destPath);
        const dbPath = `/uploads/book-covers/${destFilename}`;
        book.coverImage = dbPath;
        book.image_url = dbPath;
        await book.save();
        console.log(`✅ AI cover copied: ${title} → ${dbPath}`);
        updated++;
      } catch (e) {
        console.log(`❌ Failed to copy for ${title}: ${e.message}`);
      }
    } else {
      // URL — just update database directly
      book.coverImage = coverInfo.src;
      book.image_url = coverInfo.src;
      await book.save();
      console.log(`✅ URL cover set: ${title}`);
      updated++;
    }
  }

  console.log(`\n✅ Total updated: ${updated}/${Object.keys(coverMap).length}`);
  process.exit(0);
};

run();
