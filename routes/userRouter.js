const express = require('express');
const { register, login, getOtp, verifyOtp, getAllUsers } = require('../controllers/userController');
const { InviteMail } = require('../controllers/emailController');

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/getOtp', getOtp);
router.post('/auth/verify-otp', verifyOtp);


router.get('/user/getAllUsers/:userId', getAllUsers);


router.post('/auth/inviteMail', InviteMail);

module.exports = router;
