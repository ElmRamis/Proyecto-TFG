const express = require('express');
const router = express.Router();
const Note = require('../models/Note')
const emailController = require('../helpers/emailController');
const { isAuthenticated } = require('../helpers/auth');

router.get('/formulario', isAuthenticated, async (req, res) => {
    const notes = await Note.find().lean();
    res.render('emailForm', { notes });
});

router.post('/enviar', emailController.sendEmail);

module.exports = router;
