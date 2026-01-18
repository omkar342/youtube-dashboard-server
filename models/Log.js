const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Log', logSchema);
