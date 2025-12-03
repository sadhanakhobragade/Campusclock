// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');

const app = express();

// ---- Environment variables ----
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campussync';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// ---- Connect to MongoDB ----
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// ---- Middleware ----
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.set('trust proxy', 1);

// ---- Session ----
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false,               // in local dev
      sameSite: 'lax',
    },
  })
);

// Debug log for each request (optional, helps see 404)
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// ---- Routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reminders', require('./routes/reminders'));

// ---- 404 handler for unknown routes ----
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});