import Conversation from "../models/Conversation.js";
import { fetchPubMedData } from "../services/pubMedService.js";
import { generateAiResponse, optimizeMedicalQuery } from "../services/llmService.js";

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

        const userId = req.user.id;

        const conversation = await Conversation.findOne({ _id: conversationId, userId: userId });
        if (!conversation) {
            const err = new Error('Conversation not found or unauthorised');
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
        if (conversationId) {
            conversation = await Conversation.findOne({ _id: conversationId, userId: userId });
            if (!conversation) {
                const err = new Error('Conversation not found or unauthorised');
                err.status = 404;
                return next(err);
            }
        }
        else {
            let title = message.substring(0, Math.min(30, message.length)) + '...';
            conversation = new Conversation({ userId, title: title });
        }

        conversation.messages.push({ role: 'user', content: message });

        // Optimize the user's natural language into a PubMed boolean query
        const optimizedQuery = await optimizeMedicalQuery(message);
        console.log('Optimized Query mapped to PubMed:', optimizedQuery);

        // Fetching data from pubmed and generating AI response by providing abstracts as context
        const { citations, abstracts } = await fetchPubMedData(optimizedQuery);
        
        console.log('Citations:', citations);
        console.log('Abstracts:', abstracts);

        const aiResponseText = await generateAiResponse(message, abstracts);

        const aiResponse = {
            role: 'assistant',
            content: aiResponseText,
            citations: citations
        }

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