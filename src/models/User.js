const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;
const crypto = require('crypto');

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    date: { type: Date, default: Date.now }
});

// Método para encriptar la contraseña
UserSchema.methods.encryptPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt); 
    return hash;
};

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Método para generar un token de restablecimiento
UserSchema.methods.generateResetToken = function () {
    // Genera un token de restablecimiento
    const token = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = token;
    // El token expira en 1 hora
    this.resetPasswordExpires = Date.now() + 3600000;
    return token;
};

module.exports = mongoose.model('User', UserSchema);


/*
CREATE TABLE User (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    resetPasswordToken VARCHAR(255),
    resetPasswordExpires TIMESTAMP,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/