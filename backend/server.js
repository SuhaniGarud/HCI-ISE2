const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5000;

// Enable CORS for React frontend
app.use(cors());

// Middleware to parse incoming requests as JSON
app.use(express.json());

// MySQL database connection setup using environment variables
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'suhani@27',
  database: 'university',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Search route to fetch data based on table and search term
app.get('/api/search', (req, res) => {
    const { table } = req.query;

    // Build the query based on the table name
    let query = '';
    switch (table) {
        case 'Classroom':
            query = 'SELECT building, room_number, capacity FROM Classroom';
            break;
        case 'Department':
            query = 'SELECT dept_name, building, budget FROM Department';
            break;
        case 'Course':
            query = 'SELECT course_id, title, dept_name, credits FROM Course';
            break;
        case 'Instructor':
            query = 'SELECT ID, name, dept_name, salary FROM Instructor';
            break;
        case 'Section':
            query = 'SELECT course_id, sec_id, semester, year, building, room_number, time_slot_id FROM Section';
            break;
        case 'Teaches':
            query = 'SELECT ID, course_id, sec_id, semester, year FROM Teaches';
            break;
        case 'Student':
            query = 'SELECT ID, name, dept_name, tot_cred FROM Student';
            break;
        case 'Takes':
            query = 'SELECT ID, course_id, sec_id, semester, year, grade FROM Takes';
            break;
        case 'Advisor':
            query = 'SELECT s_ID, i_ID FROM Advisor';
            break;
        case 'TimeSlot':
            query = 'SELECT time_slot_id, day, start_time, end_time FROM TimeSlot';
            break;
        case 'Prereq':
            query = 'SELECT course_id, prereq_id FROM Prereq';
            break;
        default:
            return res.status(400).send({ error: 'Invalid table name' });
    }

    // Execute the query
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).send({ error: 'Failed to fetch data from database' });
        }
        console.log(`Results for ${table}:`, results.length);  // Debug line to log the result count
        res.json(results);
    });
});




// Visualization route to fetch data for a specific table
app.get('/api/visualize', async (req, res) => {
  const table = req.query.table;

  // Validate table name
  const allowedTables = ['Course', 'Department', 'Instructor', 'Classroom', 'Student', 'Takes', 'Section', 'Teaches', 'Advisor', 'TimeSlot', 'Prereq'];
  if (!allowedTables.includes(table)) {
    return res.status(400).send({ error: 'Invalid table name' });
  }

  // SQL queries for visualization data
  const visualizationQueries = {
    Course: 'SELECT title, credits FROM Course',
    Department: 'SELECT dept_name, budget FROM Department',
    Instructor: 'SELECT name, salary FROM Instructor',
    Classroom: 'SELECT building, room_number, capacity FROM Classroom',
    Student: 'SELECT name, tot_cred FROM Student',
    Takes: 'SELECT course_id, grade FROM Takes',
    Section: 'SELECT course_id, sec_id, enrollment FROM Section',
    Teaches: 'SELECT ID, course_id FROM Teaches',
    Advisor: 'SELECT s_ID, COUNT(*) AS advisees_count FROM Advisor GROUP BY s_ID',
    TimeSlot: 'SELECT day, start_time, available_slots FROM TimeSlot',
    Prereq: 'SELECT course_id, prereq_id FROM Prereq',
  };

  try {
    const [results] = await db.promise().query(visualizationQueries[table]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send({ error: 'Failed to fetch data from database' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
