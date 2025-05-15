
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserNoteSchema = new Schema({
    userEmail: { type: String, required: true },
    noteTitle: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserNote', UserNoteSchema);

/*CREATE TABLE UserNote (
    id SERIAL PRIMARY KEY,
    userEmail VARCHAR(255) NOT NULL,
    noteTitle VARCHAR(255) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/