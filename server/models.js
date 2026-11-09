const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: Number, min: 1, max: 5, default: 1 },
  rollNo: { type: String, unique: true },
  courses: [String]
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  name: String, email: String, subject: String, body: String
}, { timestamps: true });

module.exports = {
  Student: mongoose.model('Student', studentSchema),
  Message: mongoose.model('Message', messageSchema)
};
