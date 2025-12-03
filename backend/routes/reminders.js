// server/routes/reminders.js
const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { isLoggedIn, isFaculty, isStudent } = require('../middleware/auth');

// --- Faculty Route ---
// POST /api/reminders
// Faculty can create a new assignment/reminder
router.post('/', isLoggedIn, isFaculty, (req, res) => {
  const { title, subject, course, semester, dueDate, details } = req.body;
  const facultyId = req.session.user.id;

  const newAssignment = new Assignment({
    title,
    subject,
    course,
    semester,
    dueDate,
    details,
    faculty: facultyId
  });

  newAssignment.save()
    .then(assignment => {
      res.status(201).json(assignment);
    })
    .catch(err => res.status(500).json({ message: 'Server error', err }));
});

// --- Student Route ---
// GET /api/reminders
// Students get reminders only for their course and semester
router.get('/', isLoggedIn, isStudent, (req, res) => {
  const { course, semester } = req.session.user; // From our auth.js fix!

  if (!course || !semester) {
    return res.status(400).json({ message: 'User profile is incomplete' });
  }

  Assignment.find({ course: course, semester: semester })
    .sort({ dueDate: 1 }) // Show closest deadlines first
    .then(assignments => {
      res.json(assignments);
    })
    .catch(err => res.status(500).json({ message: 'Server error', err }));
});

// (Optional) Faculty can also get reminders they've posted
router.get('/my-reminders', isLoggedIn, isFaculty, (req, res) => {
    Assignment.find({ faculty: req.session.user.id })
      .sort({ createdAt: -1 })
      .then(assignments => res.json(assignments))
      .catch(err => res.status(500).json({ message: 'Server error', err }));
});

// !! IMPORTANT !! Make sure this line is at the bottom
module.exports = router;