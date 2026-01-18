require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5174',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/youtube-dashboard')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
const notesRoutes = require('./routes/notes');
const aiRoutes = require('./routes/ai');
const youtubeRoutes = require('./routes/youtube');

app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/youtube', youtubeRoutes);
app.get('/health', (req, res) => res.send('Server is running'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
