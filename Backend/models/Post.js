import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    // Store user ID for moderation but don't expose in responses
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Anonymous identifier for display (e.g., "Peer #123")
    anonymousId: {
        type: String,
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    replyCount: {
        type: Number,
        default: 0
    },
    reactionCounts: {
        support: { type: Number, default: 0 },
        relate: { type: Number, default: 0 },
        hope: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Index for efficient queries
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ isActive: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;

