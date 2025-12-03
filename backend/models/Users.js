//backend/models/Users.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs'); 

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true
  },
  course: { type: String }, 
  semester: { type: Number },
  department: { type: String }
  ,
completedAssignments: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Assignment'
}]

});

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model('User', userSchema);