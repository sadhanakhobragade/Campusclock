# CampusClock – Attendance, Timetable & Reminder Management System

CampusClock is a role-based web application for colleges and institutes to manage attendance, timetables, and assignment reminders for students and faculty.

The system supports three roles:

- **Student** – View attendance stats, timetable, and assignment reminders.
- **Faculty** – Mark attendance, view reports, and create assignment reminders.
- **Admin** – Manage subjects and map them to faculty.

---

## Features

- User authentication (sign-up and login) with session-based auth.
- Role-based access control (student, faculty, admin).
- Attendance:
  - Faculty marking of per-lecture attendance.
  - Student attendance statistics (overall and subject-wise).
  - Faculty attendance reports.
- Timetable:
  - Lecture and exam timetables.
  - Filter by course and timetable type.
  - Add, edit, and delete timetable entries.
- Assignments & Reminders:
  - Faculty can post assignment/low-attendance reminders.
  - Students can view relevant reminders and mark them as completed.
- Subjects & User Management:
  - Admin can create subjects and assign them to faculty.
  - APIs to fetch students by course and all faculty members.
- User profile view & logout.

---

## Tech Stack

### Frontend

- React (Create React App)
- React Router (`react-router-dom`)
- Axios
- React Context API for authentication state
- CSS modules / custom CSS
- React Icons (`react-icons`)

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- express-session + connect-mongo (session storage)
- bcryptjs (password hashing)
- cors

---

## Project Structure

```text
client/           # React frontend
  src/
    pages/        # Home, Auth, Attendance, Timetable, Reminders, Admin, Profile
    components/   # Navbar, Footer, Faculty/Student components, etc.
    context/      # AuthContext for login/signup/logout

server/           # Node/Express backend
  models/         # Users, Subject, Attendance, TimeTable, Assignment
  routes/         # auth, attendance, timetable, subjects, users, reminders
  middleware/     # Role-based auth middleware
  server.js       # App entry point
