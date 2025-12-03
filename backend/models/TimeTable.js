const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const scheduleEntrySchema = new Schema({
  day: { type: String, required: true }, 
  time: { type: String, required: true }, 
  subject: { type: String, required: true },
  faculty: { type: String }, 
  venue: { type: String } 
});
const timeTableSchema = new Schema({
  course: { type: String, required: true },
  semester: { type: Number }, 
  type: {
    type: String,
    enum: ['lecture', 'exam'], 
    required: true
  },
  schedule: [scheduleEntrySchema]
});

module.exports = mongoose.model('TimeTable', timeTableSchema);