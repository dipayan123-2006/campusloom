const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  due: String,
  done: { type: Boolean, default: false }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: Number, min: 1, max: 5, default: 1 },
  rollNo: { type: String, unique: true },
  courses: [String],
  tasks: [taskSchema],
  focusMinutes: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastFocusDay: String,
  avatar: { type: String, default: '#1B998B' }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  name: String, email: String, subject: String, body: String
}, { timestamps: true });

module.exports = {
  Student: mongoose.model('Student', studentSchema),
  Message: mongoose.model('Message', messageSchema)
};
