/**
 * fix-book-images.mjs
 * 
 * Connects to MongoDB, finds books with broken/missing image URLs,
 * and auto-fixes them using the Open Library Covers API (by ISBN or title+author).
 * 
 * Run: node fix-book-images.mjs
 */

import mongoose from 'mongoose';
import https from 'https';
import http from 'http';

// ── Config ──────────────────────────────────────────────────────────────────
const MONGO_URI = 'mongodb+srv://sricholabookstore:abc46@bookshopcluster.1kml93f.mongodb.net/book_store?retryWrites=true&w=majority&appName=BookShopCluster';
const DELAY_MS = 600;   // Rate-limit: wait between requests

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Sleep for ms milliseconds */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** HEAD-check a URL – returns true if status < 400 */
function urlWorks(url) {
    return new Promise((resolve) => {
        try {
            const mod = url.startsWith('https') ? https : http;
            const req = mod.request(url, { method: 'HEAD', timeout: 6000 }, (res) => {
                resolve(res.statusCode < 400);
            });
            req.on('error', () => resolve(false));
            req.on('timeout', () => { req.destroy(); resolve(false); });
            req.end();
        } catch {
            resolve(false);
        }
    });
}

/** Try Open Library cover by ISBN */
function olByIsbn(isbn) {
    const size = 'L';
    return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

/** Search Open Library by title+author and return best cover URL */
async function olBySearch(title, author) {
    const q = encodeURIComponent(`${title} ${author}`);
    return new Promise((resolve) => {
        https.get(`https://openlibrary.org/search.json?q=${q}&limit=5&fields=cover_i,isbn`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const docs = json.docs || [];
                    // Try cover_i (cover ID) first
                    for (const doc of docs) {
                        if (doc.cover_i) {
                            resolve(`https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`);
                            return;
                        }
                    }
                    // Try ISBNs from search results
                    for (const doc of docs) {
                        const isbns = doc.isbn || [];
                        if (isbns.length > 0) {
                            resolve(olByIsbn(isbns[0]));
                            return;
                        }
                    }
                    resolve(null);
                } catch {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

/** Find a working image URL for a book */
async function findWorkingImage(book) {
    // 1. If isbn provided, try it directly
    if (book.isbn) {
        const url = olByIsbn(book.isbn);
        if (await urlWorks(url)) return url;
        await sleep(DELAY_MS);
    }

    // 2. Search by title + author
    const url = await olBySearch(book.title, book.author);
    if (url) {
        await sleep(DELAY_MS);
        if (await urlWorks(url)) return url;
    }

    return null; // could not find
}

// ── Mongoose ──────────────────────────────────────────────────────────────────

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    isbn: String,
    image_url: String,
    coverImage: String,
}, { strict: false });

const Book = mongoose.model('Book', bookSchema);

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    console.log('Connecting to MongoDB…');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.\n');

    const books = await Book.find({});
    console.log(`Total books: ${books.length}\n`);

    let fixed = 0;
    let skipped = 0;
    let failed = 0;

    for (const book of books) {
        const currentUrl = book.image_url || book.coverImage;
        const isExternal = currentUrl && (currentUrl.startsWith('http://') || currentUrl.startsWith('https://'));

        // Check if current URL works
        if (isExternal) {
            const works = await urlWorks(currentUrl);
            if (works) {
                process.stdout.write(`✅ OK  : ${book.title}\n`);
                skipped++;
                await sleep(200);
                continue;
            }
        }

        // Try to find a new working image
        process.stdout.write(`🔍 Fix : ${book.title} (${book.author})… `);
        const newUrl = await findWorkingImage(book);

        if (newUrl) {
            book.image_url = newUrl;
            await book.save();
            process.stdout.write(`✅ Fixed → ${newUrl}\n`);
            fixed++;
        } else {
            process.stdout.write(`❌ Could not find image\n`);
            failed++;
        }

        await sleep(DELAY_MS);
    }

    console.log(`\n─────────────────────────────────`);
    console.log(`Done! Fixed: ${fixed} | Already OK: ${skipped} | Failed: ${failed}`);
    await mongoose.disconnect();
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
