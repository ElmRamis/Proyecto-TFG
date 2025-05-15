const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Note = require('../models/Note');
const UserNote = require('../models/UserNote');
const { isAdmin } = require('../helpers/auth');

router.get('/notes/asign', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('email');
        const notes = await Note.find().select('title');
        res.render('notes/asign-notes', { users, notes });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los datos de los usuarios o las notas.');
    }
});

router.post('/form', async (req, res) => {
    const { userEmail, noteTitle } = req.body;
    
    try {
        const newUserNote = new UserNote({ userEmail, noteTitle });
        await newUserNote.save();
        res.send(`Usuario: ${userEmail}, Nota: ${noteTitle}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al guardar la información del formulario.');
    }
});

module.exports = router;
