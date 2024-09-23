const authService = require('../services/userServices');

const register = async (req, res) => {
    const { userInfo, aboutInfo, personalInfo, privacy, security, screenMode } = req.body;
    try {
        const user = await authService.register(userInfo, aboutInfo, personalInfo, privacy, security, screenMode);
        res.status(201).json({ user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    try {
        const token = await authService.login(email, password);
        res.status(200).json({ UserData: token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getOtp = async (req, res) => {
    const { token, userId } = req.body;
    if (token && userId) {
        try {
            const response = await authService.getOtpService(token, userId);
            res.status(200).send({ message: 'Notification sent successfully', response });
        } catch (error) {
            console.error('Error in getOtp controller:', error);
            res.status(500).send({ message: 'Error sending notification', error });
        }
    } else {
        res.status(400).send({ message: 'Token and userId are required' });
    }
};


const verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;
    if (userId && otp) {
        try {
            const isVerified = await authService.verifyOtpService(userId, otp);
            if (isVerified) {
                res.status(200).send({ message: 'OTP verified successfully' });
            } else {
                res.status(400).send({ message: 'Invalid OTP' });
            }
        } catch (error) {
            res.status(500).send({ message: 'Error verifying OTP', error });
        }
    } else {
        res.status(400).send({ message: 'User ID and OTP are required' });
    }
};

const getAllUsers = async (req, res) => {
    const userId = req.params.userId;

    try {
        const users = await authService.getAllUsersservice(userId);
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
    getOtp,
    verifyOtp,
    getAllUsers
};
