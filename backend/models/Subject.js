// models/Subject.js (NEW FILE)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
  name: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: Number },
  
  // THIS IS THE LINK:
  // It stores the _id of a user who has the 'faculty' role
  facultyId: { 
    type: Schema.Types.ObjectId,
    ref: 'User', // This tells Mongoose it points to your 'User' model
    required: true
  }
});

module.exports = mongoose.model('Subject', subjectSchema);