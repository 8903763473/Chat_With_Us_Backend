const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        native: { type: String, required: true },
        password: { type: String, required: true },
        mobile: { type: String, required: true },
        otp: { type: String },
    },
    aboutInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        mobile: { type: String, required: true },
        aboutMe: { type: String, required: true },
    },
    personalInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        mobile: { type: String, required: true },
        aboutMe: { type: String, required: true },
    },
    privacy: {
        allowtoViewProfilePhoto: { type: String, enum: ['Everyone', 'Selected', 'No one'], required: true },
        lastSeen: { type: String, required: true },
        status: { type: String, enum: ['Everyone', 'Selected', 'No one'], required: true },
        readReceipts: { type: Boolean, required: true },
        allowtoAddinGroups: { type: String, enum: ['Everyone', 'Selected', 'No one'], required: true },
    },
    security: {
        allowNotification: { type: Boolean, required: true },
    },
    screenMode: {
        theme: { type: String, required: true },
    },
    
});

module.exports = mongoose.model('User', UserSchema);
