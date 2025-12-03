//backend/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const bcrypt = require('bcryptjs');

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(4404).json({ message: 'User not found' });
      }

      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // FIX: Add 'course' and 'semester' to the session
            req.session.user = {
              id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
              course: user.course,     // <-- ADD THIS
              semester: user.semester // <-- ADD THIS
            };
            
            res.json({ message: 'Login successful', user: req.session.user });
          } else {
            res.status(400).json({ message: 'Incorrect password' });
          }
        });
    })
    .catch(err => res.status(500).json({ message: 'Server error', err }));
});

router.get('/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid'); 
    res.json({ message: 'Logout successful' });
  });
});

router.post('/signup', (req, res) => {
  // 1. ADD 'semester' to this line:
  const { name, email, password, role, course, department, semester } = req.body;

  User.findOne({ email: email })
    .then(existingUser => {
      if (existingUser) {
        return res.status(400).json({ msg: 'User already exists' });
      }
      const newUser = new User({
        name,
        email,
        password, 
        role,
        course: role === 'student' ? course : undefined,
        department: role === 'teacher' ? department : undefined,
        semester: role === 'student' ? semester : undefined, // <-- 2. ADD THIS LINE
      });
      
      newUser.save()
        .then(user => {
          // 3. ADD 'semester' to the session
          req.session.user = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            course: user.course,
            semester: user.semester // <-- 4. ADD THIS LINE
          };
          res.json({ msg: 'Signup successful', user: req.session.user });
        })
        .catch(err => {
          console.error('Error saving user:', err);
          res.status(500).json({ msg: 'Server error while saving user' });
        });
    })
    .catch(err => {
      console.error('Error checking user:', err);
      res.status(500).json({ msg: 'Server error' });
    });
});
module.exports = router;