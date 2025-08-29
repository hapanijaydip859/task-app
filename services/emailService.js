const nodemailer = require("nodemailer");
const config = require('../config/config');

exports.sendOtpEmail = async function (to, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.emailUser,
            pass: config.emailPassword
        }
    });

    const mailOptions = {
        from: `"OTP Verification" <${config.emailUser}>`,
        to: to,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
        html: `<h3>Your OTP code is <b>${otp}</b></h3><p>This code will expire in 2 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
};