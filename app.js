// CodeCraftHub - a simple REST API for tracking the courses a developer wants to learn.
// Data is stored in a plain JSON file (courses.json), so no database is needed.

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Where the course data lives. The file is created automatically when it is missing.
const DATA_FILE = path.join(__dirname, 'courses.json');

// The only status values a course is allowed to have.
const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// Let Express read JSON request bodies.
app.use(express.json());

// ---------------------------------------------------------------------------
// Helper functions for reading and writing the JSON file
// ---------------------------------------------------------------------------

// Create courses.json with an empty list if it does not exist yet.
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

// Read every course from the file. Throws an error if the file cannot be read or parsed.
function readCourses() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return raw.trim() === '' ? [] : JSON.parse(raw);
}

// Save the whole list of courses back to the file.
function writeCourses(courses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2));
}

// Work out the next id: one more than the highest existing id (starts at 1).
function nextId(courses) {
  return courses.reduce((max, course) => Math.max(max, course.id), 0) + 1;
}

// Check that a date string looks like YYYY-MM-DD and is a real calendar date.
function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Send a consistent error response.
function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// POST /api/courses - add a new course
app.post('/api/courses', (req, res) => {
  try {
    const { name, description, target_date, status } = req.body || {};

    // Every field is required.
    const missing = [];
    if (!name) missing.push('name');
    if (!description) missing.push('description');
    if (!target_date) missing.push('target_date');
    if (!status) missing.push('status');
    if (missing.length > 0) {
      return sendError(res, 400, 'Missing required field(s): ' + missing.join(', '));
    }

    if (!isValidDate(target_date)) {
      return sendError(res, 400, 'target_date must be a valid date in the format YYYY-MM-DD');
    }
    if (!VALID_STATUSES.includes(status)) {
      return sendError(res, 400, 'status must be one of: ' + VALID_STATUSES.join(', '));
    }

    const courses = readCourses();
    const course = {
      id: nextId(courses),
      name,
      description,
      target_date,
      status,
      created_at: new Date().toISOString()
    };
    courses.push(course);
    writeCourses(courses);

    return res.status(201).json(course);
  } catch (err) {
    return sendError(res, 500, 'Could not save the course: ' + err.message);
  }
});

// GET /api/courses/stats - totals for all courses and for each status
// (declared before /api/courses/:id so "stats" is not treated as an id)
app.get('/api/courses/stats', (req, res) => {
  try {
    const courses = readCourses();
    const byStatus = {};
    VALID_STATUSES.forEach((status) => {
      byStatus[status] = courses.filter((course) => course.status === status).length;
    });
    return res.json({ total: courses.length, by_status: byStatus });
  } catch (err) {
    return sendError(res, 500, 'Could not read the courses: ' + err.message);
  }
});

// GET /api/courses - get all courses
app.get('/api/courses', (req, res) => {
  try {
    return res.json(readCourses());
  } catch (err) {
    return sendError(res, 500, 'Could not read the courses: ' + err.message);
  }
});

// GET /api/courses/:id - get one course
app.get('/api/courses/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const course = readCourses().find((item) => item.id === id);
    if (!course) {
      return sendError(res, 404, 'Course with id ' + req.params.id + ' was not found');
    }
    return res.json(course);
  } catch (err) {
    return sendError(res, 500, 'Could not read the course: ' + err.message);
  }
});

// PUT /api/courses/:id - update a course (send only the fields you want to change)
app.put('/api/courses/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const courses = readCourses();
    const index = courses.findIndex((item) => item.id === id);
    if (index === -1) {
      return sendError(res, 404, 'Course with id ' + req.params.id + ' was not found');
    }

    const updates = req.body || {};

    if (updates.target_date !== undefined && !isValidDate(updates.target_date)) {
      return sendError(res, 400, 'target_date must be a valid date in the format YYYY-MM-DD');
    }
    if (updates.status !== undefined && !VALID_STATUSES.includes(updates.status)) {
      return sendError(res, 400, 'status must be one of: ' + VALID_STATUSES.join(', '));
    }
    ['name', 'description'].forEach((field) => {
      if (updates[field] === '') {
        updates[field] = undefined;
      }
    });

    // Only these fields can be changed; id and created_at stay as they are.
    ['name', 'description', 'target_date', 'status'].forEach((field) => {
      if (updates[field] !== undefined) {
        courses[index][field] = updates[field];
      }
    });

    writeCourses(courses);
    return res.json(courses[index]);
  } catch (err) {
    return sendError(res, 500, 'Could not update the course: ' + err.message);
  }
});

// DELETE /api/courses/:id - delete a course
app.delete('/api/courses/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const courses = readCourses();
    const index = courses.findIndex((item) => item.id === id);
    if (index === -1) {
      return sendError(res, 404, 'Course with id ' + req.params.id + ' was not found');
    }

    const removed = courses.splice(index, 1)[0];
    writeCourses(courses);
    return res.json({ message: 'Course deleted successfully', course: removed });
  } catch (err) {
    return sendError(res, 500, 'Could not delete the course: ' + err.message);
  }
});

// Anything else is an unknown route.
app.use((req, res) => {
  sendError(res, 404, 'Route not found');
});

// ---------------------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------------------
ensureDataFile();
app.listen(PORT, () => {
  console.log('CodeCraftHub API is starting...');
  console.log('Data will be stored in: ' + DATA_FILE);
  console.log('API is available at: http://localhost:' + PORT);
});
