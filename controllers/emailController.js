// emailController.js
const emailService = require('../services/emailService');

const InviteMail = async (req, res) => {
  try {
    const { email, message, redirectLink, author } = req.body;
    const emailResponse = await emailService.sendEmail(email, message, redirectLink, author);
    res.status(200).json(emailResponse);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to send invitation email',
      error: error.message
    });
  }
};

module.exports = {
  InviteMail,
};
