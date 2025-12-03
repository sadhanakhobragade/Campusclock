// backend/routes/users.js
const express = require('express');
const router = express.Router();

const Users = require('../models/Users');
const { isLoggedIn, isAdmin } = require('../middleware/auth');

// Simple test route to make sure /api/users works
router.get('/', (req, res) => {
  res.json({ message: 'Users root route working' });
});


router.get('/me', isLoggedIn, (req, res) => {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Directly return the user stored in session
  return res.json(sessionUser);
});



// ---------- Get students by course ----------
router.get('/students', isLoggedIn, async (req, res) => {
  const { course } = req.query;

  if (!course) {
    return res
      .status(400)
      .json({ message: 'Course query parameter is required' });
  }

  try {
    const students = await Users.find({
      role: 'student',
      course: course,
    }).select('name _id');
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---------- Get all faculty ----------
router.get('/faculty', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const faculty = await Users.find({ role: 'faculty' }).select('name _id');
    res.json(faculty);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
