import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    reactionType: {
        type: String,
        enum: ['support', 'relate', 'hope'],
        required: true
    }
}, {
    timestamps: true
});

// Ensure one reaction per user per post (user can change reaction type)
reactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;

