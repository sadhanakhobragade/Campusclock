const Assignment = require('../models/Assignment');
const User = require('../models/User');

// --- 1. Faculty Create Assignment ---
exports.createAssignment = async (req, res) => {
  try {
    const { title, dueDate, submissionNote } = req.body;

    // req.user is from authMiddleware
    // Faculty's department is used to tag the assignment
    const newAssignment = new Assignment({
      title,
      dueDate,
      submissionNote,
      department: req.user.department, 
      createdBy: req.user.id
    });

    const savedAssignment = await newAssignment.save();
    res.status(201).json(savedAssignment);

  } catch (error) {
    res.status(500).json({ message: 'Server error creating assignment' });
  }
};

// --- 2. Student/Faculty Get Assignments ---
exports.getAssignments = async (req, res) => {
  try {
    // Get all master assignments for the user's department
    const assignments = await Assignment.find({ department: req.user.department })
                                        .sort({ dueDate: 'asc' });

    // Get the student's personal completed list
    const completedList = req.user.completedAssignments || [];

    // Combine the lists: add a "status" field to each assignment
    const processedAssignments = assignments.map(assignment => {
      const isCompleted = completedList.includes(assignment._id.toString());
      return {
        ...assignment.toObject(), // Convert Mongoose doc to plain object
        status: isCompleted ? 'completed' : 'pending'
      };
    });

    res.json(processedAssignments);

  } catch (error) {
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
};

// --- 3. Student Toggles Status ---
exports.toggleAssignmentStatus = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const user = await User.findById(req.user.id);

    const completedList = user.completedAssignments;
    const assignmentIndex = completedList.indexOf(assignmentId);

    let newStatus = '';

    if (assignmentIndex > -1) {
      // It's already completed, so remove it (mark as pending)
      completedList.splice(assignmentIndex, 1);
      newStatus = 'pending';
    } else {
      // It's not completed, so add it
      completedList.push(assignmentId);
      newStatus = 'completed';
    }

    user.completedAssignments = completedList;
    await user.save();

    res.json({ assignmentId, status: newStatus });

  } catch (error) {
    res.status(500).json({ message: 'Server error toggling status' });
  }
};