import asyncHandler from 'express-async-handler';
import axios from 'axios';
import Book from '../models/Book.js';
import ChatHistory from '../models/ChatHistory.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// @desc    Handle chat request and forward to n8n or handle locally
// @route   POST /api/chat
// @access  Private
const handleChat = asyncHandler(async (req, res) => {
    const { chatId, message } = req.body;

    if (!chatId || !message) {
        res.status(400);
        throw new Error('Please provide chatId and message');
    }

    // 0. Check for bestseller requests (for automated history saving)
    const bestsellerKeywords = ['best selling', 'bestselling', 'best seller', 'top books', 'bestseller'];
    const isBestsellerRequest = bestsellerKeywords.some(keyword => message.toLowerCase().includes(keyword));

    if (isBestsellerRequest) {
        const limitMatch = message.match(/top\s*(\d+)/i);
        const limit = limitMatch ? Math.min(parseInt(limitMatch[1]), 20) : 10;
        
        const books = await Book.find({}).sort({ soldCount: -1 }).limit(limit);

        if (books.length > 0) {
            const responseText = `Here are the top ${books.length} bestselling books:\n\n` + 
                books.map((b, index) => 
                    `#${index + 1} 📚 **${b.title}**\n   👤 Author: ${b.author}\n   💰 Price: ₹${b.price}\n   📈 Sold: ${b.soldCount}`
                ).join('\n\n');
            
            const bookIds = books.map(b => b._id.toString());

            // Save to history
            await ChatHistory.create({
                userId: req.user._id,
                message: message,
                response: responseText,
                timestamp: new Date()
            });

            res.json({ text: responseText, bookIds: bookIds });
            return;
        }
    }

    // Enhanced Local Search & URL Request Logic

    // 1. Check if user is asking for URLs/links
    const urlRequestRegex = /(?:give|show|provide|get|send|share|what'?s?\s+the)\s+(?:me\s+)?(?:url|link|website|page|product\s+page)s?\s+(?:for|of|to)?\s*(?:the\s+)?(?:above|these|those|this|that)?/i;
    const isUrlRequest = urlRequestRegex.test(message);

    if (isUrlRequest) {
        // Try to find recently mentioned books or get featured books
        const books = await Book.find({ featured: true }).limit(5);

        if (books.length > 0) {
            const bookLinks = books.map(b =>
                `📚 **${b.title}**\n   👤 Author: ${b.author}`
            ).join('\n\n');
            const bookIds = books.map(b => b._id.toString());

            if (req.user && req.user._id) {
                await ChatHistory.create({
                    userId: req.user._id,
                    message: message,
                    response: `Here are our featured books:\n\n${bookLinks}\n\n✨ Click the buttons below to view the book details!`,
                    timestamp: new Date()
                });
            }

            res.json({
                text: `Here are our featured books:\n\n${bookLinks}\n\n✨ Click the buttons below to view the book details!`,
                bookIds: bookIds
            });
            return;
        }
    }

    // 2. Check for price-based queries (priority over general search)
    const priceRegex = /(?:show|find|search|get|list)?.*?(?:book|books)?.*?(?:under|below|less than|under ₹|below ₹|less than ₹)\s*(\d+)/i;
    const priceMatch = message.match(priceRegex);

    if (priceMatch && priceMatch[1]) {
        const maxPrice = parseInt(priceMatch[1]);
        const books = await Book.find({
            price: { $lte: maxPrice },
            stock: { $gt: 0 }
        }).limit(5);

        if (books.length > 0) {
            const results = books.map(b =>
                `📚 **${b.title}**\n   👤 Author: ${b.author}\n   💰 Price: ₹${b.price}\n   🔖 Category: ${b.category}`
            ).join('\n\n');
            const bookIds = books.map(b => b._id.toString());

            if (req.user && req.user._id) {
                await ChatHistory.create({
                    userId: req.user._id,
                    message: message,
                    response: `Here are some books under ₹${maxPrice}:\n\n${results}`,
                    timestamp: new Date()
                });
            }

            res.json({
                text: `Here are some books under ₹${maxPrice}:\n\n${results}`,
                bookIds: bookIds
            });
            return;
        } else {
            res.json({
                text: `Sorry, I couldn't find any books under ₹${maxPrice} in our current inventory. Would you like me to show you some books in a different price range?`
            });
            return;
        }
    }

    // 3. Check for book search queries
    const searchRegex = /(?:search|find|looking for|show me)\s+(?:book|books)?\s*(.+)/i;
    const match = message.match(searchRegex);

    if (match && match[1]) {
        const query = match[1].trim();
        const books = await Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
            ]
        }).limit(3);

        if (books.length > 0) {
            const results = books.map(b =>
                `📚 **${b.title}**\n   👤 Author: ${b.author}\n   💰 Price: ₹${b.price}`
            ).join('\n\n');
            const bookIds = books.map(b => b._id.toString());

            if (req.user && req.user._id) {
                await ChatHistory.create({
                    userId: req.user._id,
                    message: message,
                    response: `Here are some books I found for "${query}":\n\n${results}`,
                    timestamp: new Date()
                });
            }

            res.json({
                text: `Here are some books I found for "${query}":\n\n${results}`,
                bookIds: bookIds
            });
            return;
        } else {
            // If no books found locally, provide helpful response
            res.json({
                text: `I couldn't find any books matching "${query}" in our inventory. Would you like me to show you our featured books instead, or are you looking for books in a specific price range?`
            });
            return;
        }
    }

    // Prepare book inventory context for Gemini
    const availableBooks = await Book.find({ stock: { $gt: 0 } })
        .select('title author price category _id description')
        .limit(30);

    const bookList = availableBooks.map(b =>
        `- "${b.title}" by ${b.author} | ₹${b.price} | ${b.category} | ID: ${b._id}`
    ).join('\n');

    const { sessionId, orderContext, pageContext, chatHistory } = req.body;

    // Build system prompt with live inventory
    const systemPrompt = `You are a helpful AI book assistant for Sri Chola Book Shop.
Your job is to help customers find and recommend books from our store only.

RULES:
- ONLY recommend books from the inventory list below
- NEVER suggest Amazon, Flipkart, or any external store
- DO NOT list or include any raw URLs or markdown links in your response.
- Format book recommendations cleanly exactly like this:
  Title: [Title]
  Author: [Author]
  Price: ₹[Price]
- Be friendly, warm, and conversational
- If asked something unrelated to books, gently redirect to book recommendations
- IMPORTANT: If you are recommending any books, you MUST append a list of their IDs at the very end of your response exactly in this format on a new line:
  RECOMMENDED_IDS: id1, id2
- Do not add any text after the RECOMMENDED_IDS line.

CURRENT BOOK INVENTORY:
${bookList}
`;

    // Build conversation history for Gemini
    let history = (chatHistory || []).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(m.content || "") }]
    }));

    // Ensure the history ends with a 'model' response (since we are about to send a 'user' message)
    // and starts with a 'user' message, which Gemini requires.
    while (history.length > 0 && history[0].role !== 'user') {
        history.shift(); // Remove starting model messages
    }
    while (history.length > 0 && history[history.length - 1].role !== 'model') {
        history.pop(); // Ensure it ends with a model message if there are user messages without responses
    }

    // --- Gemini AI Call ---
    console.log('Chat request:', message);

    // Helper: local fallback for category/general queries when AI is unavailable
    const localGeneralFallback = async (userMessage) => {
        const lowerMsg = userMessage.toLowerCase();

        // Greeting
        if (/^(hi|hello|hey|good\s*(morning|evening|afternoon)|namaste)/i.test(lowerMsg.trim())) {
            return { text: "Hello! Welcome to Sri Chola Book Shop 😊 I can help you find books by title, author, category, or price. What are you looking for today?", bookIds: [] };
        }

        // Category keywords
        const categoryMap = {
            biography: ['biography', 'biographies', 'memoir', 'life story'],
            fiction: ['fiction', 'novel', 'story', 'stories'],
            'non-fiction': ['non fiction', 'nonfiction', 'non-fiction'],
            children: ['children', "children's", 'kids', 'child'],
            mystery: ['mystery', 'thriller', 'detective', 'crime'],
            science: ['science', 'scientific', 'physics', 'chemistry', 'biology'],
            history: ['history', 'historical', 'ancient', 'medieval'],
            romance: ['romance', 'romantic', 'love story'],
            fantasy: ['fantasy', 'magic', 'dragon', 'wizard'],
            'self-help': ['self help', 'self-help', 'motivation', 'motivational', 'personal development'],
        };

        for (const [cat, keywords] of Object.entries(categoryMap)) {
            if (keywords.some(k => lowerMsg.includes(k))) {
                const books = await Book.find({ category: { $regex: cat, $options: 'i' }, stock: { $gt: 0 } }).limit(5);
                if (books.length > 0) {
                    const results = books.map(b =>
                        `📚 **${b.title}**\n   👤 Author: ${b.author}\n   💰 Price: ₹${b.price}`
                    ).join('\n\n');
                    const bookIds = books.map(b => b._id.toString());
                    return { text: `Here are some **${cat}** books available in our store:\n\n${results}`, bookIds };
                }
            }
        }

        // Author search
        const authorMatch = lowerMsg.match(/books?\s+by\s+([a-z\s]+)/i);
        if (authorMatch) {
            const authorName = authorMatch[1].trim();
            const books = await Book.find({ author: { $regex: authorName, $options: 'i' }, stock: { $gt: 0 } }).limit(5);
            if (books.length > 0) {
                const results = books.map(b =>
                    `📚 **${b.title}**\n   👤 Author: ${b.author}\n   💰 Price: ₹${b.price}`
                ).join('\n\n');
                const bookIds = books.map(b => b._id.toString());
                return { text: `Here are books by **${authorName}** in our collection:\n\n${results}`, bookIds };
            }
        }

        // Default: show featured books
        const featured = await Book.find({ stock: { $gt: 0 } }).sort({ soldCount: -1 }).limit(5);
        if (featured.length > 0) {
            const results = featured.map(b =>
                `📚 **${b.title}**\n   👤 Author: ${b.author}\n   💰 Price: ₹${b.price}\n   🔖 Category: ${b.category}`
            ).join('\n\n');
            const bookIds = featured.map(b => b._id.toString());
            return {
                text: `Here are some popular books from our collection:\n\n${results}\n\n💡 You can also search by category, author, title, or price (e.g. "books under ₹300").`,
                bookIds
            };
        }

        return { text: "I'm here to help you find books! Try asking for a specific category, author, or title. You can also say 'show books under ₹300'.", bookIds: [] };
    };

    try {
        if (!process.env.GEMINI_API_KEY) {
            const fallback = await localGeneralFallback(message);
            console.log('Chat response (no API key fallback):', fallback.text.slice(0, 80));
            return res.json({ success: true, text: fallback.text, bookIds: fallback.bookIds });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // gemini-2.0-flash is the correct current model name
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(message);

        // Safe extraction using optional chaining
        let responseText =
            result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
            result?.response?.text?.() ||
            null;

        if (!responseText) {
            throw new Error('Empty response from Gemini');
        }

        let bookIds = [];
        const idMatch = responseText.match(/RECOMMENDED_IDS:\s*([a-fA-F0-9,\s]+)/i);
        if (idMatch) {
            bookIds = idMatch[1].split(',').map(s => s.trim()).filter(Boolean);
            responseText = responseText.replace(/RECOMMENDED_IDS:\s*([a-fA-F0-9,\s]+)/i, '').trim();
        }

        if (req.user && req.user._id) {
            try {
                await ChatHistory.create({
                    userId: req.user._id,
                    message,
                    response: responseText,
                    timestamp: new Date()
                });
            } catch (historyError) {
                console.error('Failed to save chat history:', historyError);
            }
        }

        console.log('Chat response (Gemini):', responseText.slice(0, 80));
        res.json({ success: true, text: responseText, bookIds });

    } catch (error) {
        console.error('Gemini AI Error — falling back to local handler. Reason:', error?.message || error);

        try {
            const fallback = await localGeneralFallback(message);

            // Save fallback to history too
            if (req.user && req.user._id) {
                try {
                    await ChatHistory.create({
                        userId: req.user._id,
                        message,
                        response: fallback.text,
                        timestamp: new Date()
                    });
                } catch (_) { /* ignore history errors */ }
            }

            console.log('Chat response (local fallback):', fallback.text.slice(0, 80));
            res.json({ success: true, text: fallback.text, bookIds: fallback.bookIds });
        } catch (fallbackError) {
            console.error('Local fallback also failed:', fallbackError);
            res.json({ success: false, text: "I'm having trouble right now. Please try using the search bar to find books!" });
        }
    }
});

// @desc    Get latest 10 chat messages for a user
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = asyncHandler(async (req, res) => {
    const history = await ChatHistory.find({ userId: req.user._id })
        .sort({ timestamp: -1 })
        .limit(10);
    
    // Return in chronological order for the frontend
    res.json(history.reverse());
});

// @desc    Get older chat messages with pagination
// @route   GET /api/chat/history/older
// @access  Private
const getOlderChatHistory = asyncHandler(async (req, res) => {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const history = await ChatHistory.find({ userId: req.user._id })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

    res.json(history.reverse());
});

// @desc    Clear all chat history for a user
// @route   DELETE /api/chat/history
// @access  Private
const clearChatHistory = asyncHandler(async (req, res) => {
    await ChatHistory.deleteMany({ userId: req.user._id });
    res.json({ message: 'Chat history cleared' });
});

export { handleChat, getChatHistory, getOlderChatHistory, clearChatHistory };
