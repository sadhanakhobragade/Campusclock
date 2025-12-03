const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');
const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'You must be logged in' });
  }
  next();
};

const isFaculty = (req, res, next) => {
  if (req.session.user.role !== 'faculty') {
    return res.status(403).json({ message: 'Access denied: Faculty only' });
  }
  next();
};


router.post('/', isLoggedIn, isFaculty, async (req, res) => {
  const { subjectId, date, records } = req.body;
  const facultyId = req.session.user.id;
  if (!records || records.length === 0) {
    return res.status(400).json({ message: 'No attendance records provided' });
  }

  try {
    const attendanceData = records.map(record => ({
      studentId: record.studentId,
      subjectId: subjectId,
      date: date,
      status: record.status,
      markedBy: facultyId
    }));
    await Attendance.insertMany(attendanceData, { ordered: false });
    
    res.status(201).json({ message: 'Attendance marked successfully' });
  
  } catch (err) { 
    if (err.code === 11000) {
      return res.status(201).json({ message: 'Attendance updated ( records may have already existed )' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error while marking attendance' });
  }
});


/**
 * @route   GET /api/attendance/me
 * @desc    Student views their own attendance percentages
 * @access  Student (but anyone logged in can see their own)
 */
// Implements SRS 1.14, 1.15, 1.16
router.get('/me', isLoggedIn, async (req, res) => {
  const studentId = new mongoose.Types.ObjectId(req.session.user.id);

  try {
    // This aggregation pipeline calculates percentages on the server [cite: 15]
    const attendanceStats = await Attendance.aggregate([
      // 1. Find all records for the logged-in student 
      { $match: { studentId: studentId } },
      
      // 2. Group by subject to count total and present
      {
        $group: {
          _id: '$subjectId',
          totalLectures: { $sum: 1 },
          presentLectures: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          }
        }
      },
      
      // 3. (Optional) Populate subject details
      {
        $lookup: {
          from: 'subjects', // Assumes you have a 'subjects' collection
          localField: '_id',
          foreignField: '_id',
          as: 'subject'
        }
      },
      
      // 4. Calculate percentage
      {
        $project: {
          subjectId: '$_id',
          subjectName: { $arrayElemAt: ['$subject.name', 0] }, // Get subject name
          totalLectures: '$totalLectures',
          presentLectures: '$presentLectures',
          percentage: {
            $multiply: [{ $divide: ['$presentLectures', '$totalLectures'] }, 100]
          }
        }
      }
    ]);

    // Calculate overall percentage
    const overallTotal = attendanceStats.reduce((sum, s) => sum + s.totalLectures, 0);
    const overallPresent = attendanceStats.reduce((sum, s) => sum + s.presentLectures, 0);
    const overallPercentage = (overallTotal === 0) ? 0 : (overallPresent / overallTotal) * 100;

    res.json({
      subjectWise: attendanceStats,
      overall: {
        total: overallTotal,
        present: overallPresent,
        percentage: overallPercentage
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
});


router.get('/faculty-report', isLoggedIn, isFaculty, async (req, res) => {
  try {
    const facultyId = req.session.user.id;
    const records = await Attendance.find({ markedBy: facultyId })
      .populate('studentId', 'name') 
      .populate('subjectId', 'name') 
    res.json(records);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;