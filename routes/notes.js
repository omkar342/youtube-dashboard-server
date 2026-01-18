const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Log = require('../models/Log');

// Get notes for a video
router.get('/:videoId', async (req, res) => {
    try {
        const notes = await Note.find({ videoId: req.params.videoId }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a note
router.post('/', async (req, res) => {
    try {
        const { videoId, title, content, tags } = req.body;
        const newNote = new Note({ videoId, title, content, tags });
        await newNote.save();
        
        // Log event
        await Log.create({
            event: 'NOTE_CREATED',
            details: { noteId: newNote._id, videoId }
        });

        res.status(201).json(newNote);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a note
router.put('/:id', async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id, 
            { title, content, tags },
            { new: true }
        );
        res.json(updatedNote);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a note
router.delete('/:id', async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
