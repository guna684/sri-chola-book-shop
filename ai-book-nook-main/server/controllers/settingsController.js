import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';

// @desc    Get application settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({});

    if (!settings) {
        settings = await Settings.create({ lowStockLimit: 20 });
    }

    res.json(settings);
});

// @desc    Update application settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    const { lowStockLimit } = req.body;

    let settings = await Settings.findOne({});

    if (!settings) {
        settings = new Settings({ lowStockLimit: 20 });
    }

    if (lowStockLimit !== undefined) {
        settings.lowStockLimit = lowStockLimit;
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});

export { getSettings, updateSettings };
