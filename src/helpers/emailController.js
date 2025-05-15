const nodemailer = require('nodemailer');
const Note = require('../models/Note')

const sendEmail = async (req, res) => {
    const { mensaje, note } = req.body;

    if ( !mensaje || !note) {
        req.flash('error_msg', 'All spaces are mandatory');
        res.redirect('/formulario');
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587, // Puerto para STARTTLS
        secure: false, // STARTTLS requiere que esto sea false
        auth: {
            user: 'mailinparagtfg@gmail.com',
            pass: 'smsk gfmz ebjj fviv' // Contraseña de aplicación de Google
        }
    });

    let mailOptions = {
        from: 'mailinparagtfg@gmail.com',
        to: 'eramis152@gmail.com',  // Dirección del destinatario
        subject: `Nuevo mensaje de ${req.user.email}`,
        text: `${mensaje}\n\nContenido de la nota seleccionada:\n${note}`
    };

    try {
        await transporter.sendMail(mailOptions);
        req.flash('success_msg', 'Email sent successfully!');
    } catch (error) {
        req.flash('error_msg', 'Error sending email: ' + error.message);
    }
    res.redirect('/formulario');
};

module.exports = {
    sendEmail
};
