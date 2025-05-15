const express = require('express');
const router = express.Router();
const UserNote = require('../models/UserNote');
const vipUser = require('../models/Vip'); // Importa el array de VIPs

// Función checkUser que verifica si el usuario tiene una nota con un título específico
async function checkUser(req, res, next, noteTitle) {
    try {
        // Recupera todas las notas del usuario
        const userNotes = await UserNote.find({ userEmail: req.user.email }).sort({ date: 'desc' });
        
        // Extrae los títulos de las notas del usuario
        const noteTitles = userNotes.map(userNote => userNote.noteTitle);

        // Verifica si el título específico está en los títulos de las notas del usuario
        const hasNote = noteTitles.includes(noteTitle);

        // Verifica si el usuario es VIP
        const isVip = vipUser.includes(req.user.email); // Usa el array para verificar si es VIP

        // Continúa si la nota existe o si el usuario es VIP
        if (hasNote || isVip) {
            next();
        } else {
            req.flash('error_msg', `Access Denied: You do not have a note titled "${noteTitle}".`);
            res.redirect('/formulario'); // Redirige en caso de error
        }
    } catch (err) {
        req.flash('error_msg', 'Server Error. Please try again later.');
        console.log(err);
        res.redirect('/notes/mynotes'); // Redirige en caso de error del servidor
    }
}

module.exports = checkUser;