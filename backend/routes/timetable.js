const express = require('express');
const router = express.Router();
const TimeTable = require('../models/TimeTable');

const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'You must be logged in' });
  }
  next();
};

const isFacultyOrAdmin = (req, res, next) => {
  if (req.session.user.role === 'student') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.get('/', isLoggedIn, (req, res) => {
  const { course, type, semester } = req.query;
  let filter = {};
  if (course) filter.course = course;
  if (type) filter.type = type;
  if (semester) filter.semester = semester;
  TimeTable.findOne(filter)
    .then(timetables => {
      res.json(timetables);
    })
    .catch(err => res.status(500).json({ message: 'Server error', err }));
});





router.post('/', isLoggedIn, isFacultyOrAdmin, async (req, res) => {
  try {
    const { course, type, schedule } = req.body;
    const query = { course: course, type: type };
    const update = {
      $push: {
        schedule: { $each: schedule }
      }
    };
    const options = {
      new: true,
      upsert: true
    };
    const updatedTimetable = await TimeTable.findOneAndUpdate(query, update, options);

    res.status(200).json(updatedTimetable); 

  } catch (err) {
    console.error("DATABASE UPDATE FAILED:", err); 
    res.status(500).json({ 
      message: 'Failed to save timetable.', 
      error: err.message
    });
  }
});



router.delete('/:timetableId/entry/:index', async (req, res) => {
  try {
    const { timetableId, index } = req.params;

    // 1. Find timetable
    const timetable = await TimeTable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    // 2. Validate schedule + index
    if (!Array.isArray(timetable.schedule)) {
      return res.status(500).json({ message: 'Schedule is not an array' });
    }

    const idx = parseInt(index, 10);
    if (isNaN(idx) || idx < 0 || idx >= timetable.schedule.length) {
      return res.status(400).json({ message: 'Invalid index' });
    }

    // 3. Remove that entry
    timetable.schedule.splice(idx, 1);

    // 4. Save changes
    await timetable.save();

    return res.json({
      message: 'Entry deleted successfully',
      timetable,
    });
  } catch (err) {
    console.error('Delete timetable entry error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;