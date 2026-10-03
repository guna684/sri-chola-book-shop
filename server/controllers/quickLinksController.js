import asyncHandler from 'express-async-handler';

// Quick Links data (in production, this would be in a database)
let quickLinks = [
    { id: 1, title: 'About', path: '/about', icon: 'Info', order: 1, active: true },
    { id: 2, title: 'Contact', path: '/contact', icon: 'Phone', order: 2, active: true },
    { id: 3, title: 'FAQs', path: '/faqs', icon: 'HelpCircle', order: 3, active: true },
    { id: 4, title: 'Privacy', path: '/privacy', icon: 'Shield', order: 4, active: true }
];

// Categories data (in production, this would be in a database)
let categories = [
    { id: 1, name: 'Fiction', slug: 'fiction', order: 1, active: true },
    { id: 2, name: 'Non-Fiction', slug: 'non-fiction', order: 2, active: true },
    { id: 3, name: 'Mystery', slug: 'mystery', order: 3, active: true },
    { id: 4, name: 'Romance', slug: 'romance', order: 4, active: true },
    { id: 5, name: 'Sci-Fi', slug: 'sci-fi', order: 5, active: true },
    { id: 6, name: 'Self-Help', slug: 'self-help', order: 6, active: true }
];

// @desc    Get all quick links (admin: all, public: active only)
// @route   GET /api/admin/quick-links, GET /api/admin/quick-links/public
// @access  Private/Admin or Public
const getQuickLinks = asyncHandler(async (req, res) => {
    const isPublic = req.path.includes('/public');
    let result = quickLinks.sort((a, b) => a.order - b.order);
    if (isPublic) {
        result = result.filter(link => link.active);
    }
    res.json(result);
});

// @desc    Update quick link
// @route   PUT /api/admin/quick-links/:id
// @access  Private/Admin
const updateQuickLink = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, path, icon, order, active } = req.body;

    const linkIndex = quickLinks.findIndex(link => link.id === parseInt(id));
    if (linkIndex === -1) {
        res.status(404);
        throw new Error('Quick link not found');
    }

    quickLinks[linkIndex] = {
        ...quickLinks[linkIndex],
        title: title || quickLinks[linkIndex].title,
        path: path || quickLinks[linkIndex].path,
        icon: icon || quickLinks[linkIndex].icon,
        order: order !== undefined ? order : quickLinks[linkIndex].order,
        active: active !== undefined ? active : quickLinks[linkIndex].active
    };

    res.json(quickLinks[linkIndex]);
});

// @desc    Add new quick link
// @route   POST /api/admin/quick-links
// @access  Private/Admin
const addQuickLink = asyncHandler(async (req, res) => {
    const { title, path, icon, order, active } = req.body;

    if (!title || !path) {
        res.status(400);
        throw new Error('Title and path are required');
    }

    const newLink = {
        id: Math.max(...quickLinks.map(l => l.id)) + 1,
        title,
        path,
        icon: icon || 'Link',
        order: order !== undefined ? order : quickLinks.length + 1,
        active: active !== undefined ? active : true
    };

    quickLinks.push(newLink);
    res.status(201).json(newLink);
});

// @desc    Delete quick link
// @route   DELETE /api/admin/quick-links/:id
// @access  Private/Admin
const deleteQuickLink = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const linkIndex = quickLinks.findIndex(link => link.id === parseInt(id));

    if (linkIndex === -1) {
        res.status(404);
        throw new Error('Quick link not found');
    }

    quickLinks.splice(linkIndex, 1);
    res.json({ message: 'Quick link removed successfully' });
});

// @desc    Get all categories (admin: all, public: active only)
// @route   GET /api/admin/categories, GET /api/admin/categories/public
// @access  Private/Admin or Public
const getCategories = asyncHandler(async (req, res) => {
    const isPublic = req.path.includes('/public');
    let result = categories.sort((a, b) => a.order - b.order);
    if (isPublic) {
        result = result.filter(cat => cat.active);
    }
    res.json(result);
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, slug, order, active } = req.body;

    const categoryIndex = categories.findIndex(cat => cat.id === parseInt(id));
    if (categoryIndex === -1) {
        res.status(404);
        throw new Error('Category not found');
    }

    categories[categoryIndex] = {
        ...categories[categoryIndex],
        name: name || categories[categoryIndex].name,
        slug: slug || categories[categoryIndex].slug,
        order: order !== undefined ? order : categories[categoryIndex].order,
        active: active !== undefined ? active : categories[categoryIndex].active
    };

    res.json(categories[categoryIndex]);
});

// @desc    Add new category
// @route   POST /api/admin/categories
// @access  Private/Admin
const addCategory = asyncHandler(async (req, res) => {
    const { name, slug, order, active } = req.body;

    if (!name || !slug) {
        res.status(400);
        throw new Error('Name and slug are required');
    }

    const newCategory = {
        id: Math.max(...categories.map(c => c.id)) + 1,
        name,
        slug,
        order: order !== undefined ? order : categories.length + 1,
        active: active !== undefined ? active : true
    };

    categories.push(newCategory);
    res.status(201).json(newCategory);
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const categoryIndex = categories.findIndex(cat => cat.id === parseInt(id));

    if (categoryIndex === -1) {
        res.status(404);
        throw new Error('Category not found');
    }

    categories.splice(categoryIndex, 1);
    res.json({ message: 'Category removed successfully' });
});

export {
    getQuickLinks,
    updateQuickLink,
    addQuickLink,
    deleteQuickLink,
    getCategories,
    updateCategory,
    addCategory,
    deleteCategory
};
