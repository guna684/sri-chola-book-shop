import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// TTL Index: Delete documents older than 30 days (2592000 seconds)
chatHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;
