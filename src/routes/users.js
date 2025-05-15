const express = require('express');
const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcrypt'); 
const { body, validationResult } = require('express-validator'); 
const { isAuthenticated } = require('../helpers/auth');
const router = express.Router();
const nodemailer = require('nodemailer'); 
const { isAdmin } = require('../helpers/auth');

router.get('/users/signin', (req, res) => {
    res.render('users/signin');
});

router.post('/users/singin' , passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

router.get('/users/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/users/signup', async (req, res) => {
    const { name, email, password, confirm_password } = req.body;
    const errors = [];
    if (name === '' || email === '' || password === '' ) {
        errors.push({ text: 'Please enter all credentials to proceed' });
    }
    if (password !== confirm_password) {
        errors.push({ text: 'The Passwords do not match' });
    }
    if (password.length <= 4) {
        errors.push({ text: 'The Password has to be bigger than 4 characters' });
    }
    if (errors.length > 0) {
        res.render('users/signup', { errors, name, email, password, confirm_password });
    } else {
        const emailUser = await User.findOne({email: email});
        if (emailUser) {
            req.flash('error_msg', 'The Email is already registered');
            res.redirect('/users/signup');
        } else if (email.startsWith('VIP')) {    
            req.flash('error_msg', 'Jaja, No');
            res.redirect('/users/signup');
        } else {
            const newUser = new User({name, email, password});
            newUser.password = await newUser.encryptPassword(password);
            await newUser.save();
            req.flash('success_msg', 'You are registerd');
            res.redirect('/users/signin');
        }
    }
});

router.get('/users/signupAdmin', isAdmin, (req, res) => {
    res.render('users/signupAdmin');
});

router.post('/users/signupAdmin', async (req, res) => {
    const { name, email, password, confirm_password } = req.body;
    const errors = [];
    if (name === '' || email === '' || password === '' ) {
        errors.push({ text: 'Please enter all credentials to proceed' });
    }
    if (password !== confirm_password) {
        errors.push({ text: 'The Passwords do not match' });
    }
    if (password.length <= 4) {
        errors.push({ text: 'The Password has to be bigger than 4 characters' });
    }
    if (errors.length > 0) {
        res.render('users/signup', { errors, name, email, password, confirm_password });
    } else {
        const emailUser = await User.findOne({email: email});
        if (emailUser) {
            req.flash('error_msg', 'The Email is already registered');
            res.redirect('/users/signup');
        } else {
            const newUser = new User({name, email, password});
            newUser.password = await newUser.encryptPassword(password);
            await newUser.save();
            req.flash('success_msg', 'You are registerd');
            res.redirect('/users/signin');
        }
    }
});

router.get('/users/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('An error occurred while logging out.');
        }
        res.redirect('/');
    });
});

router.get('/users/configuration', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.render('users/configuration', { user });
    } catch (error) {
        req.flash('error_msg', 'Error retrieving user information');
        res.redirect('/');
    }
});

router.post('/users/change-password', isAuthenticated, 
    [
        body('currentPassword').not().isEmpty().withMessage('Current password is required'),
        body('newPassword').isLength({ min: 5 }).withMessage('New password must be at least 5 characters long'),
        body('confirmNewPassword').custom((value, { req }) => value === req.body.newPassword).withMessage('Passwords do not match')
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error_msg', errors.array().map(error => error.msg).join(' '));
            return res.redirect('/users/configuration');
        }

        const { currentPassword, newPassword } = req.body;
        try {
            const user = await User.findById(req.user._id);

            // Verifica la contraseña actual
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                req.flash('error_msg', 'Current password is incorrect');
                return res.redirect('/users/configuration');
            }

            // Hash la nueva contraseña y actualízala
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();

            req.flash('success_msg', 'Password changed successfully');
            res.redirect('/users/configuration');
        } catch (err) {
            req.flash('error_msg', 'Error changing password');
            res.redirect('/users/configuration');
        }
    }
);

// Ruta para solicitar el restablecimiento de contraseña (enviar el correo)
router.get('/users/forgot', (req, res) => {
    res.render('users/forgot');
});

router.post('/users/forgot', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error_msg', 'No account with that email address exists.');
            return res.redirect('/users/forgot');
        }

        const token = user.generateResetToken();
        await user.save();

        // Configurar el correo
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587, // Puerto para STARTTLS
            secure: false, // STARTTLS requiere que esto sea false
            auth: {
                user: 'mailinparagtfg@gmail.com',
                pass: 'smsk gfmz ebjj fviv' // Contraseña de aplicación de Google
            }
        });

        /*Metodo para recuperar contraseña admin*/
        /*const urlReset = `http://${req.headers.host}/users/reset/${token}`;*/
        /*console.log(urlReset);*/

        const mailOptions = {
            from: 'mailinparagtfg@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                Please click on the following link, or paste this into your browser to complete the process:\n\n
                http://${req.headers.host}/users/reset/${token}\n\n
                If you did not request this, please ignore this email and your password will remain unchanged.`
        };

        await transporter.sendMail(mailOptions);
        req.flash('success_msg', 'An email has been sent with further instructions.');
        res.redirect('/users/signin');
    } catch (error) {
        req.flash('error_msg', 'Error requesting password reset');
        res.redirect('/users/forgot');
    }
});

// Ruta para mostrar el formulario de restablecimiento de contraseña
router.get('/users/reset/:token', async (req, res) => {
    try {
        const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/users/forgot');
        }
        res.render('users/reset', { token: req.params.token });
    } catch (error) {
        req.flash('error_msg', 'Error accessing reset password form');
        res.redirect('/users/forgot');
    }
});

// Ruta para actualizar la contraseña
router.post('/users/reset/:token', [
    body('newPassword').not().isEmpty().withMessage('New password is required'),
    body('confirmNewPassword').custom((value, { req }) => value === req.body.newPassword).withMessage('Passwords do not match')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error_msg', errors.array().map(error => error.msg).join(' '));
        return res.redirect(`/users/reset/${req.params.token}`);
    }

    const { newPassword } = req.body;
    console.log('New Password Received');

    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/users/forgot');
        }

        user.password = await user.encryptPassword(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash('success_msg', 'Password has been updated.');
        res.redirect('/users/signin');
    } catch (error) {
        req.flash('error_msg', 'Error resetting password');
        res.redirect(`/users/reset/${req.params.token}`);
    }
});

module.exports = router;
