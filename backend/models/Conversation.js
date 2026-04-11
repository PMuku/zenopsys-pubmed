import mongoose from "mongoose";

const citationSchema = new mongoose.Schema({
    title: {type: String, required: true},
    authors: {type: String, required: true},
    year: {type: String, required: true},
    pmid: {type: String, required: true},
    url: {type: String, required: true}
}, {_id: false });

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    citations: [citationSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const conversationSchema = new mongoose.Schema({
    userId: {
        ref: "User",
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        default: "New Conversation"
    },
    messages: [messageSchema]
}, {
    timestamps: true
});

export default mongoose.model("Conversation", conversationSchema);