// server/models/Assignment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  course: { type: String, required: true },   // e.g., "fymca"
  semester: { type: Number, required: true }, // e.g., 1
  dueDate: { type: Date, required: true },
  details: { type: String },
  faculty: { type: Schema.Types.ObjectId, ref: 'User' } // Who posted it
}, {
  timestamps: true // Adds createdAt
});

module.exports = mongoose.model('Assignment', assignmentSchema);