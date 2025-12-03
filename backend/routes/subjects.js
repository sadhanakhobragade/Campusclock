const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { isLoggedIn, isFaculty,isAdmin } = require('../middleware/auth'); // Adjust path as needed
router.get('/my-subjects', isLoggedIn, isFaculty, async (req, res) => {
  try {
    const subjects = await Subject.find({ facultyId: req.session.user.id });
    if (!subjects) {
      return res.status(404).json({ message: 'No subjects found for you' });
    }
    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const newSubject = new Subject({
      name: req.body.name,
      course: req.body.course,
      semester: req.body.semester,
      facultyId: req.body.facultyId
    });
    const subject = await newSubject.save();
    res.status(201).json(subject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', isLoggedIn, isAdmin, async (req, res) => {
  try {
    // .populate() automatically fetches the faculty's name
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;