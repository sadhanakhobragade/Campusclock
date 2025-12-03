const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId, // <-- Must be ObjectId, NOT String
    ref: 'User',
    required: true
  },
  subjectId: {
    type: Schema.Types.ObjectId, // <-- Must be ObjectId, NOT String
    ref: 'Subject',
    required: true
  },
  date: {
    type: Date, // <-- Must be Date, NOT String
    required: true
  },
  status: {
    type: String, // <-- This is OK
    enum: ['present', 'absent'],
    required: true
  },
  markedBy: {
    type: Schema.Types.ObjectId, // <-- Must be ObjectId, NOT String
    ref: 'User',
    required: true // <-- Make sure this is required
  }
}, { timestamps: true });

// This prevents duplicate entries for the same student, subject, and day
attendanceSchema.index({ studentId: 1, subjectId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);