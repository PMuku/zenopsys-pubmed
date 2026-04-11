import Conversation from "../models/Conversation.js";

// Fetch conversation history
// GET /api/users/conversations
export const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({ userId}).sort({ updatedAt: -1 }).select('title updatedAt');
        
        res.status(200).json(conversations);
    } catch (error) {
        const err = new Error('Failed to fetch conversations');
        err.status = 500;
        next(err);
    }
};

// Fetch particular conversation
// GET /api/users/conversations/:conversationId
export const getConversationById = async (req, res, next) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            const err = new Error('Conversation not found');
            err.status = 404;
            return next(err);
        }

        res.status(200).json(conversation);
    } catch (error) {
        next(error);
    }
};

// Send a message in a new conversation
// POST /api/users/conversations
export const sendMessage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { conversationId, message } = req.body;

        if (!message) {
            const err = new Error('Message is required');
            err.status = 400;
            return next(err);
        }

        let conversation;
        if (conversationId)
            conversation = await Conversation.findById(conversationId);
        else
            conversation = new Conversation({ userId, title: 'New Conversation' });

        conversation.messages.push({ role: 'user', content: message });

        // Placeholder AI response
        const aiResponse = {
            role: 'assistant',
            content: `Placeholder response from AI for query on "${message}"`,
            citations: [
                {
                    title: 'Sample Research Paper',
                    authors: 'Author A',
                    year: '2026',
                    pmid: '12345678',
                    url: 'https://samplelink.com'
                }
            ]
        };

        conversation.messages.push(aiResponse);
        await conversation.save();

        res.status(200).json(conversation);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        const err = new Error('Failed to send message');
        err.status = 500;
        next(err);
    }
};