import express from 'express';
import { suggestPosts } from '../controller/recommendation.controller.js'; 
import { verifyToken } from '../utils/verifyUser.js'; // Pastikan user login

const router = express.Router();

// Rute: /api/recommendation/suggest/:userId
router.get('/suggest/:userId', verifyToken, suggestPosts);

export default router;