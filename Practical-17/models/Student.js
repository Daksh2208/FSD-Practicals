const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: Number,
    email: { type: String, required: true, unique: true },
    course: String
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
