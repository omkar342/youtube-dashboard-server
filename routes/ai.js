const express = require('express');
const router = express.Router();

router.post('/suggest-titles', (req, res) => {
    const { currentTitle, description } = req.body;
    
    // Mock AI Logic - In a real app, call OpenAI/Gemini API here
    const suggestions = [
        `Must Watch: ${currentTitle}`,
        `${currentTitle} - Explained!`,
        `Top Secrets of ${currentTitle}`,
        `Why ${currentTitle} Matters`,
        `The Ultimate Guide to ${currentTitle}`
    ];

    // Log event
    // require('../models/Log').create({ event: 'AI_SUGGESTIONS_GENERATED', details: { currentTitle } }); 
    // Commented out to avoid circular dependency issues if not careful, but usually fine.

    res.json({ suggestions: suggestions.slice(0, 3) });
});

module.exports = router;
