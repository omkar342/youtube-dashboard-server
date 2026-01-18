const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const Log = require('../models/Log');

// We will rely on the frontend to pass the ACCESS TOKEN for simplicity and security
// The Access Token is obtained via Google Identity Services (Implicit Flow) on the Client

const getAuthClient = (token) => {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    return oauth2Client;
};

// Get Video Details
router.get('/video/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No access token provided' });

    try {
        const youtube = google.youtube({ version: 'v3', auth: getAuthClient(token) });
        const response = await youtube.videos.list({
            part: 'snippet,statistics,status',
            id: req.params.id
        });
        
        if (response.data.items.length === 0) return res.status(404).json({ error: 'Video not found' });
        res.json(response.data.items[0]);
    } catch (err) {
        console.error('YouTube API Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update Video
router.put('/video/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No access token provided' });

    const { title, description, categoryId } = req.body;

    try {
        const youtube = google.youtube({ version: 'v3', auth: getAuthClient(token) });
        
        // First get the snippet to preserve other fields if needed, 
        // but for update we usually need to pass the categoryId too if we want to be safe, 
        // or just update what we have. API requires passing the whole snippet usually? 
        // Actually, videos.update requires 'part' and the resource.

        // For simplicity, we assume we get valid fields.
        // We need to fetch the video first to get the existing categoryId if not provided.
        const existing = await youtube.videos.list({
            part: 'snippet',
            id: req.params.id
        });
        const currentSnippet = existing.data.items[0].snippet;

        const response = await youtube.videos.update({
            part: 'snippet',
            requestBody: {
                id: req.params.id,
                snippet: {
                    ...currentSnippet,
                    title: title || currentSnippet.title,
                    description: description || currentSnippet.description,
                    categoryId: categoryId || currentSnippet.categoryId
                }
            }
        });

        await Log.create({
            event: 'VIDEO_UPDATED',
            details: { videoId: req.params.id, newTitle: title }
        });

        res.json(response.data);
    } catch (err) {
         console.error('YouTube API Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get Comments
router.get('/comments', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { videoId } = req.query;
    if (!token) return res.status(401).json({ error: 'No access token provided' });
    if (!videoId) return res.status(400).json({ error: 'Video ID required' });

    try {
        const youtube = google.youtube({ version: 'v3', auth: getAuthClient(token) });
        const response = await youtube.commentThreads.list({
            part: 'snippet,replies',
            videoId: videoId,
            maxResults: 20
        });
        res.json(response.data.items);
    } catch (err) {
         console.error('YouTube API Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Reply to Comment
router.post('/comments/reply', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { parentId, text } = req.body;
    if (!token) return res.status(401).json({ error: 'No access token provided' });

    try {
        const youtube = google.youtube({ version: 'v3', auth: getAuthClient(token) });
        const response = await youtube.comments.insert({
            part: 'snippet',
            requestBody: {
                snippet: {
                    parentId: parentId,
                    textOriginal: text
                }
            }
        });

        await Log.create({
            event: 'COMMENT_REPLY',
            details: { parentId, text }
        });

        res.json(response.data);
    } catch (err) {
         console.error('YouTube API Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete Comment
router.delete('/comments/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No access token provided' });

    try {
        const youtube = google.youtube({ version: 'v3', auth: getAuthClient(token) });
        await youtube.comments.delete({
            id: req.params.id
        });

        await Log.create({
            event: 'COMMENT_DELETED',
            details: { commentId: req.params.id }
        });

        res.json({ message: 'Comment deleted' });
    } catch (err) {
         console.error('YouTube API Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
