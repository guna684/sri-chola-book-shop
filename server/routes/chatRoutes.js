import express from 'express';
import { 
    handleChat, 
    getChatHistory, 
    getOlderChatHistory, 
    clearChatHistory 
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import Book from '../models/Book.js';

const router = express.Router();

router.post('/', protect, handleChat);
router.get('/history', protect, getChatHistory);
router.get('/history/older', protect, getOlderChatHistory);
router.delete('/history', protect, clearChatHistory);

router.get('/bestsellers', async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 10;
        if (limit > 20) limit = 20;
        if (limit < 1) limit = 1;

        const books = await Book.find({}).sort({ soldCount: -1 }).limit(limit);
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Unable to fetch books right now.' });
    }
});

export default router;
