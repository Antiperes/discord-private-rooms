const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    guildId: String,
    userId: String,
    private_voices: {
        voiceId: { type: String, default: null },
        lock: { type: Boolean, default: true }
    }
})

module.exports = mongoose.model('user', userSchema);