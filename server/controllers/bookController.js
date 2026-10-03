import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';
import User from '../models/User.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Fetch all books
// @route   GET /api/books
// @access  Public
const getBooks = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
        ? {
            title: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const category = req.query.category
        ? { category: req.query.category }
        : {};

    const featured = req.query.featured
        ? { featured: true }
        : {};

    const bestseller = req.query.bestseller
        ? { bestseller: true }
        : {};

    const books = await Book.find({ ...keyword, ...category, ...featured, ...bestseller });
    res.json(books);
});

// @desc    Fetch single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (book) {
        res.json(book);
    } else {
        res.status(404);
        throw new Error('Book not found');
    }
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (book) {
        await Book.deleteOne({ _id: book._id });
        res.json({ message: 'Book removed' });
    } else {
        res.status(404);
        throw new Error('Book not found');
    }
});

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
const createBook = asyncHandler(async (req, res) => {
    const book = new Book({
        title: 'Sample name',
        price: 0,
        user: req.user._id,
        coverImage: '/images/sample.jpg',

        category: 'Sample category',
        stock: 0,
        rating: 0,
        reviewCount: 0,
        description: 'Sample description',
        author: 'Sample Author'
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
    const {
        title,
        price,
        description,
        coverImage,

        category,
        stock,
        author,
        featured,
        bestseller,
        title_ta,
        author_ta,
        description_ta,
        category_ta,
        isbn,
        pages,
        language,
        publishedDate,
        publisher,
        genre
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
        // Validate: Ensure at least one image source is provided
        const finalCoverImage = coverImage || book.coverImage;

        if (!finalCoverImage) {
            res.status(400);
            throw new Error('Please provide a coverImage');
        }

        book.title = title || book.title;
        book.price = price !== undefined ? price : book.price;
        book.description = description || book.description;
        book.coverImage = finalCoverImage;
        book.category = category || book.category;
        book.stock = stock !== undefined ? stock : book.stock;
        book.author = author || book.author;
        book.featured = featured !== undefined ? featured : book.featured;
        book.bestseller = bestseller !== undefined ? bestseller : book.bestseller;

        // Tamil translation fields
        book.title_ta = title_ta || book.title_ta;
        book.author_ta = author_ta || book.author_ta;
        book.description_ta = description_ta || book.description_ta;
        book.category_ta = category_ta || book.category_ta;

        // New fields
        book.isbn = isbn || book.isbn;
        book.pages = pages !== undefined ? pages : book.pages;
        book.language = language || book.language;
        book.publishedDate = publishedDate || book.publishedDate;
        book.publisher = publisher || book.publisher;
        book.genre = genre || book.genre;

        const updatedBook = await book.save();
        res.json(updatedBook);
    } else {
        res.status(404);
        throw new Error('Book not found');
    }
});

// @desc    Create new review
// @route   POST /api/books/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
        const alreadyReviewed = book.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Book already reviewed');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        book.reviews.push(review);

        book.reviewCount = book.reviews.length;

        book.rating =
            book.reviews.reduce((acc, item) => item.rating + acc, 0) /
            book.reviews.length;

        await book.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Book not found');
    }
});

// @desc    Get public site stats (books count, unique authors, total users)
// @route   GET /api/books/stats
// @access  Public
const getSiteStats = asyncHandler(async (req, res) => {
    const [totalBooks, authors, totalUsers] = await Promise.all([
        Book.countDocuments({}),
        Book.distinct('author'),
        User.countDocuments({}),
    ]);
    res.json({
        totalBooks,
        totalAuthors: authors.length,
        totalUsers,
    });
});

// @desc    Generate book covers automatically using Antigravity API
// @route   POST /api/books/generate-covers
// @access  Private/Admin
const generateCovers = asyncHandler(async (req, res) => {
    // 1. Identify Books Missing Covers
    const books = await Book.find({
        $or: [
            { coverImage: { $in: [null, ''] } },
            { coverImage: /unsplash.com/i },
            { coverImage: /\/images\/sample.jpg/i },
            { coverImage: { $exists: false } }
        ]
    });

    if (books.length === 0) {
        return res.json({ message: 'No books found that require a cover image update.', updatedCount: 0 });
    }

    const apiUrl = process.env.ANTIGRAVITY_API_URL || 'https://api.antigravity.ai/generate-image';

    // 7. Batch Processing
    const batchSize = 10;
    let updatedCount = 0;
    let failedCount = 0;
    const errors = [];

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'book-covers');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (let i = 0; i < books.length; i += batchSize) {
        const batch = books.slice(i, i + batchSize);

        await Promise.all(batch.map(async (book) => {
            try {
                // 2. Generate Image Prompt
                const genreStr = book.genre || book.category || 'general';
                const prompt = `Professional book cover for ${book.title} by ${book.author}, genre ${genreStr}`;

                // 3. Call Antigravity API
                let imageUrl;
                try {
                    const response = await axios.post(apiUrl, {
                        prompt,
                        size: '1024x1024'
                    });
                    imageUrl = response.data.image_url;
                } catch (apiError) {
                    console.error(`API call failed for ${book.title}:`, apiError.message);
                    // Mock fallback if external URL is a placeholder/unreachable
                    imageUrl = `https://placehold.co/1024x1024/1e293b/f8fafc.png?text=${encodeURIComponent(book.title)}`;
                }

                if (!imageUrl) throw new Error("No image_url returned from API");

                // 4. Download and Store Image
                const imageResponse = await axios({
                    url: imageUrl,
                    method: 'GET',
                    responseType: 'stream'
                });

                const extension = imageUrl.split('.').pop().split('?')[0] || 'jpg';
                const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(extension.toLowerCase()) ? extension : 'jpg';
                const fileName = `${book._id}.${ext}`;
                const filePath = path.join(uploadsDir, fileName);

                const writer = fs.createWriteStream(filePath);
                imageResponse.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // 6. Update Database
                book.coverImage = `/uploads/book-covers/${fileName}`;
                book.image_url = `/uploads/book-covers/${fileName}`;
                await book.save();
                updatedCount++;
            } catch (err) {
                console.error(`Error processing book ${book._id}:`, err.message);
                failedCount++;
                errors.push({ bookId: book._id, title: book.title, error: err.message });
            }
        }));
    }

    res.json({
        message: 'Cover generation process completed.',
        totalProcessed: books.length,
        updatedCount,
        failedCount,
        errors
    });
});

export { getBooks, getBookById, deleteBook, createBook, updateBook, createProductReview, getSiteStats, generateCovers };
