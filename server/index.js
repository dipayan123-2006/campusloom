require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Student, Message } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// Course catalogue (day: 0=Mon..4=Fri, slot: 0..4 => 9am..1pm)
const COURSES = [
  { code: 'CS101', title: 'Programming Foundations', day: 0, slot: 0 },
  { code: 'CS204', title: 'Data Structures', day: 1, slot: 1 },
  { code: 'CS310', title: 'Database Systems', day: 2, slot: 0 },
  { code: 'MA102', title: 'Discrete Mathematics', day: 0, slot: 0 },
  { code: 'EE150', title: 'Digital Logic', day: 3, slot: 2 },
  { code: 'HU110', title: 'Technical Writing', day: 4, slot: 3 },
  { code: 'CS330', title: 'Web Engineering', day: 1, slot: 1 },
  { code: 'DS220', title: 'Statistics for Data', day: 2, slot: 4 }
];

const sign = (s) => jwt.sign({ id: s._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safe = (s) => ({ id: s._id, name: s.name, email: s.email, department: s.department,
  year: s.year, rollNo: s.rollNo, courses: s.courses, joined: s.createdAt, avatar: s.avatar,
  focusMinutes: s.focusMinutes, streak: s.streak,
  tasks: s.tasks.map((t) => ({ id: t._id, title: t.title, due: t.due, done: t.done })) });

async function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.student = await Student.findById(id);
    if (!req.student) throw new Error();
    next();
  } catch { res.status(401).json({ message: 'Please log in again.' }); }
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, department, year } = req.body;
    if (!name || !email || !password || !department)
      return res.status(400).json({ message: 'All fields are required.' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (await Student.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'That email is already registered.' });
    const count = await Student.countDocuments({ department });
    const rollNo = `CL${String(new Date().getFullYear()).slice(2)}-${department.slice(0, 2).toUpperCase()}-${String(count + 1).padStart(4, '0')}`;
    const student = await Student.create({
      name, email, department, year, rollNo, password: await bcrypt.hash(password, 10)
    });
    res.status(201).json({ token: sign(student), student: safe(student) });
  } catch (e) { res.status(500).json({ message: 'Registration failed. Try again.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email: (email || '').toLowerCase() });
  if (!student || !(await bcrypt.compare(password || '', student.password)))
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json({ token: sign(student), student: safe(student) });
});

app.get('/api/me', auth, (req, res) => res.json(safe(req.student)));

app.get('/api/courses', auth, (req, res) => res.json(COURSES));

app.post('/api/me/courses/:code', auth, async (req, res) => {
  const code = req.params.code;
  if (!COURSES.find((c) => c.code === code)) return res.status(404).json({ message: 'Course not found.' });
  const s = req.student;
  s.courses = s.courses.includes(code) ? s.courses.filter((c) => c !== code) : [...s.courses, code];
  await s.save();
  res.json(safe(s));
});

app.put('/api/me', auth, async (req, res) => {
  const { name, year, avatar } = req.body;
  const s = req.student;
  if (name && name.trim()) s.name = name.trim();
  if (year >= 1 && year <= 5) s.year = year;
  if (/^#[0-9A-Fa-f]{6}$/.test(avatar || '')) s.avatar = avatar;
  await s.save();
  res.json(safe(s));
});

app.post('/api/me/tasks', auth, async (req, res) => {
  const { title, due } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ message: 'Give the task a title.' });
  req.student.tasks.push({ title, due });
  await req.student.save();
  res.status(201).json(safe(req.student));
});

app.patch('/api/me/tasks/:id', auth, async (req, res) => {
  const t = req.student.tasks.id(req.params.id);
  if (!t) return res.status(404).json({ message: 'Task not found.' });
  t.done = !t.done;
  await req.student.save();
  res.json(safe(req.student));
});

app.delete('/api/me/tasks/:id', auth, async (req, res) => {
  req.student.tasks.pull({ _id: req.params.id });
  await req.student.save();
  res.json(safe(req.student));
});

app.post('/api/me/focus', auth, async (req, res) => {
  const minutes = Math.min(180, Math.max(1, Number(req.body.minutes) || 0));
  const s = req.student;
  const day = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (s.lastFocusDay !== day) s.streak = s.lastFocusDay === yesterday ? s.streak + 1 : 1;
  s.lastFocusDay = day;
  s.focusMinutes += minutes;
  await s.save();
  res.json(safe(s));
});

app.get('/api/leaderboard', auth, async (req, res) => {
  const top = await Student.find({ focusMinutes: { $gt: 0 } }).sort({ focusMinutes: -1 }).limit(5);
  res.json(top.map((t) => ({ id: t._id, name: t.name.split(' ')[0], department: t.department,
    minutes: t.focusMinutes, streak: t.streak, avatar: t.avatar })));
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, body } = req.body;
  if (!name || !email || !body) return res.status(400).json({ message: 'Name, email and message are required.' });
  await Message.create({ name, email, subject, body });
  res.status(201).json({ message: 'Thanks! We will reply within two working days.' });
});

// Serve the built React app (production)
const dist = path.join(__dirname, '../client/dist');
app.use(express.static(dist));
app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('CampusLoom API running')))
  .catch((e) => console.error('MongoDB connection failed:', e.message));
