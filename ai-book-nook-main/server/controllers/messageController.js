import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create new message
// @route   POST /api/messages
// @access  Public
// @desc    Create new message
// @route   POST /api/messages
// @access  Public
const createMessage = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    const newMessage = await Message.create({
        name,
        email,
        subject,
        message,
    });

    if (newMessage) {
        // Send email notification to admin (using the configured EMAIL_USER)
        try {
            await sendEmail({
                to: process.env.EMAIL_USER, // Send TO the admin/support email
                subject: `New Contact Form Message: ${subject}`,
                html: `You have received a new message from ${name} (<a href="mailto:${email}">${email}</a>):<br><br>${message}`,
            });
        } catch (error) {
            console.error('Error sending email notification:', error);
            // We don't fail the request if email sending fails, but we log it.
        }

        res.status(201).json(newMessage);
    } else {
        res.status(400);
        throw new Error('Invalid message data');
    }
});

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private/Admin
const getMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
const deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (message) {
        await Message.deleteOne({ _id: message._id });
        res.json({ message: 'Message removed' });
    } else {
        res.status(404);
        throw new Error('Message not found');
    }
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private/Admin
const markMessageAsRead = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (message) {
        message.isRead = true;
        const updatedMessage = await message.save();
        res.json(updatedMessage);
    } else {
        res.status(404);
        throw new Error('Message not found');
    }
});

// @desc    Send reply to a message
// @route   POST /api/messages/:id/reply
// @access  Private/Admin
const replyMessage = asyncHandler(async (req, res) => {
    const { subject, body } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    if (!subject || !body) {
        res.status(400);
        throw new Error('Subject and body are required');
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <p>${body.replace(/\n/g, '<br/>')}</p>
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888;">
                <strong>Original message from ${message.name}:</strong><br/>
                ${message.message}
            </p>
        </div>
    `;

    await sendEmail({
        to: message.email,
        subject: subject,
        html: htmlContent,
    });

    // Mark as read after replying
    message.isRead = true;
    await message.save();

    res.json({ success: true, message: `Reply sent to ${message.email}` });
});

export { createMessage, getMessages, deleteMessage, markMessageAsRead, replyMessage };
