const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

const Note = require('../models/Note');
const vipUser = require('../models/Vip')
const UserNote = require('../models/UserNote');
const{ isAuthenticated } = require('../helpers/auth');
const { isAdmin } = require('../helpers/auth');

router.get('/notes/#', isAuthenticated, (req, res) => {
    res.render('notes/pre-notes');
});

router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/new-note');
});

router.post('/notes/new-note', isAdmin, async (req, res) => {
    const { title, description } = req.body;
    const errors = [];
    if (!title) {
        errors.push({ text: 'Insert the title' });
    }
    if (!description) {
        errors.push({ text: 'Insert the description' });
    }
    if (errors.length > 0) {
        res.render('notes/new-note', {
            errors,
            title,
            description
        });
    } else {
        const newNote = new Note({
            title,
            description
        });
        newNote.user = req.user.id;
        await newNote.save();
        req.flash('success_msg', 'Note Added Successfully');
        res.redirect('/notes');
    }
});

router.get('/notes', isAuthenticated, async (req, res) => {
    try {
        let notes;

        if (vipUser.includes(req.user.email)) {
            notes = await Note.find().sort({ date: 'desc' });
        } else {
            const userNotes = await UserNote.find({ userEmail: req.user.email }).sort({ date: 'desc' });
            const noteTitles = userNotes.map(userNote => userNote.noteTitle);
            notes = await Note.find({ title: { $in: noteTitles } }).sort({ date: 'desc' });
        }
        
        res.render('notes/all-notes', { notes });
    } catch (error) {
        console.error('Error al obtener las notas:', error);
        res.status(500).send('Error al obtener las notas.');
    }
});

router.get('/notes/edit/:id', isAdmin, async (req, res) => {
    const note = await Note.findById(req.params.id)
    res.render('notes/edit-note', {note})
});

router.put('/notes/edit-note/:id', isAdmin, async (req, res) => {
    const { title, description } = req.body;
    await Note.findByIdAndUpdate(req.params.id, { title, description });
    req.flash('success_msg', 'Note Updated Successfully');
    res.redirect('/notes');
});

router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    try {
        // Obtener la nota por su ID
        const note = await Note.findById(req.params.id);
        if (!note) {
            req.flash('error_msg', 'Note not found');
            return res.redirect('/notes');
        }

        // Obtener el correo del usuario autenticado
        const userEmail = req.user.email;

        // Buscar la relación en UserNote
        const noteUser = await UserNote.findOne({ userEmail: userEmail, noteTitle: note.title });
        if (!noteUser) {
            req.flash('error_msg', 'Note not associated with this user');
            return res.redirect('/notes');
        }

        // Eliminar la relación en UserNote
        await UserNote.findByIdAndDelete(noteUser._id);

        // Enviar mensaje de éxito y redirigir
        req.flash('success_msg', 'Note Deleted Successfully');
        res.redirect('/notes');
    } catch (error) {
        console.error('Error deleting note:', error);
        req.flash('error_msg', 'Error deleting note');
        res.redirect('/notes');
    }
});

router.delete('/notes/superDelete/:id', isAdmin, async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Note deleted successfully');
        res.redirect('/notes');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting note');
        res.redirect('/notes');
    }
});


module.exports = router;
