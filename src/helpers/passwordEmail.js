
const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Puerto para STARTTLS
    secure: false, // STARTTLS requiere que esto sea false
    auth: {
        user: 'mailinparagtfg@gmail.com',
        pass: 'smsk gfmz ebjj fviv' // Contraseña de aplicación de Google
    }
});

const sendResetPasswordEmail = async (user, req) => {
    const token = user.generateResetToken();
    await user.save();

    const resetURL = `http://${req.headers.host}/users/reset/${token}`;

    const mailOptions = {
        from: 'mailinparagtfg@gmail.com',
        to: user.email,
        subject: 'Password Reset Request',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetURL}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    try {
        console.error('Intentando al enviar correo:');
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error al enviar correo:', error);
        return { success: false, message: error.message };
    }
};

module.exports = {
    sendResetPasswordEmail
};
