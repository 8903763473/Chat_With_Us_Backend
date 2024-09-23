const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

function encryptData(data, secretKey) {
    if (typeof secretKey !== 'string') {
        throw new TypeError('Secret key must be a string');
    }

    const algorithm = 'aes-256-cbc'; // AES-256-CBC encryption
    const key = crypto.createHash('sha256').update(secretKey).digest(); // Hash the secret key to create a 256-bit key
    const iv = crypto.randomBytes(16); // Initialization vector

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}



// Create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Use environment variables
        pass: process.env.EMAIL_PASS,
    },
    debug: true,
    tls: {
        rejectUnauthorized: false // Allows self-signed certificates, consider using a valid SSL certificate in production
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

const sendEmail = (email, message, redirectLink, author) => {
    return new Promise(async (resolve, reject) => {
        const encryptedObject = await encryptData(author, process.env.SECRET_KEY);

        const Link = redirectLink + '/' + encryptedObject.iv + '/' + encryptedObject.encryptedData + '/' + encryptedObject.key;

        console.log(Link);
        console.log(encryptedObject);

        let mailOptions = {
            from: 'chatwithus5581@gmail.com', // Sender address
            to: email, // List of recipients
            subject: 'Join with code', // Subject line
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
                    <div style="text-align: center;">
                        <img src="cid:logo" alt="Logo" style="width: 100px; height: auto;"/>
                    </div>
                    <h2 style="color: #333;">Welcome!</h2>
                    <p style="font-size: 16px; color: #555;">${message}</p>
                    <p style="font-size: 18px; color: #333; font-weight: bold;">Your Code: ${author.code}</p>
                    <p style="font-size: 16px; color: #555;"><a href="${Link}" style="color: #007BFF; text-decoration: none;">Click here</a> to join.</p>
                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
                    <p style="font-size: 14px; color: #777;">"The best way to predict the future is to create it." – Vijay</p>
                </div>
            `,
            attachments: [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../Logo.png'),
                    cid: 'logo'
                }
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error occurred:', error);
                return reject({
                    message: 'Email sending failed',
                    error: error.message
                });
            }
            console.log('Email sent:', info.response);
            resolve({
                message: 'Email sent successfully',
                info: info.response
            });
        });
    });
};

module.exports = {
    sendEmail,
};
