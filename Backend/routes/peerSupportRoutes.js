import express from 'express';
import {
    createPost,
    getPosts,
    getPost,
    createReply,
    getReplies,
    addReaction,
    getUserReaction
} from '../controllers/peerSupportController.js';

const router = express.Router();

// Post routes
router.post('/posts', createPost);
router.get('/posts', getPosts);
router.get('/posts/:postId', getPost);

// Reply routes
router.post('/posts/:postId/replies', createReply);
router.get('/posts/:postId/replies', getReplies);

// Reaction routes
router.post('/posts/:postId/reactions', addReaction);
router.get('/posts/:postId/reactions', getUserReaction);

export default router;

