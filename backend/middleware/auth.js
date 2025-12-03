    const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'You must be logged in' });
  }
  next();
};

// Checks if the logged-in user is a faculty member
const isFaculty = (req, res, next) => {
  if (req.session.user.role !== 'faculty') {
    return res.status(403).json({ message: 'Access denied: Faculty only' });
  }
  next();
};

// Checks if the logged-in user is a student
const isStudent = (req, res, next) => {
  if (req.session.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied: Students only' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }
  next();
};

module.exports = { isLoggedIn, isFaculty, isStudent, isAdmin};