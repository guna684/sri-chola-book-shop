import mongoose from 'mongoose';

const settingsSchema = mongoose.Schema(
    {
        lowStockLimit: {
            type: Number,
            required: true,
            default: 20,
        },
    },
    {
        timestamps: true,
    }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
