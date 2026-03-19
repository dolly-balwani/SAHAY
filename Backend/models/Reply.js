import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    // Store user ID for moderation but don't expose in responses
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Anonymous identifier for display
    anonymousId: {
        type: String,
        required: true
    },
    // Pre-defined supportive messages (optional)
    messageType: {
        type: String,
        enum: ['encouragement', 'shared_experience', 'custom'],
        default: 'custom'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
replySchema.index({ postId: 1, createdAt: 1 });
replySchema.index({ authorId: 1 });

const Reply = mongoose.model('Reply', replySchema);

export default Reply;

