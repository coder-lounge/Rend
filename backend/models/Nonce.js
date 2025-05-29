const mongoose = require('mongoose');

const NonceSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    nonce: {
        type: String,
        required: true,
        unique: true
    },
    used: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 5 minutes
    }
});


NonceSchema.index({ walletAddress: 1, nonce: 1 });
NonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Nonce', NonceSchema); 