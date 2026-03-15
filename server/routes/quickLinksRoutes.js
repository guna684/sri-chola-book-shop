import express from 'express';
const router = express.Router();
import {
    getQuickLinks,
    updateQuickLink,
    addQuickLink,
    deleteQuickLink,
    getCategories,
    updateCategory,
    addCategory,
    deleteCategory
} from '../controllers/quickLinksController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Public Routes (for footer display - no auth needed)
router.get('/quick-links/public', getQuickLinks);
router.get('/categories/public', getCategories);

// Admin Quick Links Routes (protected)
router.route('/quick-links')
    .get(protect, admin, getQuickLinks)
    .post(protect, admin, addQuickLink);

router.route('/quick-links/:id')
    .put(protect, admin, updateQuickLink)
    .delete(protect, admin, deleteQuickLink);

// Admin Categories Routes (protected)
router.route('/categories')
    .get(protect, admin, getCategories)
    .post(protect, admin, addCategory);

router.route('/categories/:id')
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

export default router;

