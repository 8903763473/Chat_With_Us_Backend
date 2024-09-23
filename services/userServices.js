const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');


async function generateNumericOTP(length) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }
    return otp;
}

const register = async (userInfo, aboutInfo, personalInfo, privacy, security, screenMode) => {
    const salt = await bcrypt.genSalt(10);
    userInfo.password = await bcrypt.hash(userInfo.password, salt);
    const user = new User({ userInfo, aboutInfo, personalInfo, privacy, security, screenMode });
    try {
        await user.save();
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Email already exists');
        } else {
            throw error;
        }
    }
    return user;
};

const login = async (email, password) => {
    const user = await User.findOne({ 'userInfo.email': email });
    console.log(user);

    if (!user || !(await comparePassword(password, user.userInfo.password))) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken(user);
    return {
        token: { Token: token },
        user: user
    };
};

const comparePassword = async (inputPassword, storedPassword) => {
    return bcrypt.compare(inputPassword, storedPassword);
};

const generateToken = (user) => {
    const payload = { id: user._id, username: user.userInfo.username };
    return jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' });
};

const getOtpService = async (token, userId) => {
    const message = await generateNumericOTP(4);
    const payload = {
        notification: {
            title: 'Chat_With_Us',
            body: `${message}`,
            click_action: 'ANGULAR_NOTIFICATION_CLICK',
            sound: 'notificationtone.mp3',
            badge: '1',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0-wnQQShczpqLhHmGImNKVTt9uAWsA93uxw&s',
            color: '#f45342',
            tag: 'Chat',
        }
    };

    try {
        await storeOtpInDatabase(userId, message);
        const response = await admin.messaging().sendToDevice(token, payload);
        console.log('Notification sent successfully:', response);
        return response;
    } catch (error) {
        console.error('Error sending notification:', error);
        await updateOtpInDatabase(userId, null);
        throw error;
    }
};

async function storeOtpInDatabase(userId, otp) {
    try {
        await User.updateOne({ _id: userId }, { $set: { 'userInfo.otp': otp } });
        console.log('OTP stored successfully in the database');
    } catch (error) {
        console.error('Error storing OTP in the database:', error);
        throw error;
    }
}

async function updateOtpInDatabase(userId, otp) {
    try {
        await User.updateOne({ _id: userId }, { $set: { 'userInfo.otp': otp } });
        console.log('OTP updated successfully in the database');
    } catch (error) {
        console.error('Error updating OTP in the database:', error);
        throw error;
    }
}

const verifyOtpService = async (userId, otp) => {
    try {
        const user = await User.findById(userId);
        if (user && user.userInfo.otp === otp) {
            await User.updateOne({ _id: userId }, { $unset: { 'userInfo.otp': '' } });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

const getAllUsersservice = async (userId) => {
    try {
        const users = await User.find({ _id: { $ne: userId } });
        return users;
    } catch (error) {
        throw new Error('Unable to fetch users');
    }
};

module.exports = {
    register,
    login,
    getOtpService,
    verifyOtpService,
    getAllUsersservice
};
