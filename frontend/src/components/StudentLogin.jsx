// Import React and React Hooks.
import React, { useState, useEffect } from 'react';
// Import axios Which is Used to Make HTTP Requests to the Backend API.
import axios from 'axios';

// Setting URL for Backend API
const API_URL = 'http://localhost:5000/api';

// Function for Logging Into a Selected Student Account.
function StudentLogin({ onSelectStudent }) {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Runs fetchStudents Once Component Mounts.
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch All Students from Backend.
  const fetchStudents = async () => {
    try {
      // API Request To Grab All Students.
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
      setLoading(false);
    // In The Case of an Error run console.error and Stop Loading.
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Make sure backend is running on port 5000.');
      setLoading(false);
    }
  };

  // Handles Student Login Selection.
  const handleLogin = () => {
    // Find Selected Student by Matching the Student_ID.
    const student = students.find(s => s.Student_ID === parseInt(selectedId));
    // If Student Found, Pass it Into onSelectStudent.
    if (student) {
      onSelectStudent(student);
    }
  };

  // Displays Loading Screen While Fetching Students.
  if (loading) {
    return (
      <div className="student-login">
        <h2>Loading...</h2>
      </div>
    );
  }

  // Display an Error Message to User if Fetching Students Fails.
  if (error) {
    return (
      <div className="student-login">
        <h2>Error</h2>
        <p style={{color: 'red'}}>{error}</p>
        <button onClick={fetchStudents}>Retry</button>
      </div>
    );
  }

  // JSX Returned.
  return (
    <div className="student-login">
      <h2>Select Student</h2>
      <select 
        value={selectedId} 
        onChange={(e) => setSelectedId(e.target.value)}
        className="student-select"
      >
        <option value="">-- Select a Student --</option>
        {students.map(student => (
          <option key={student.Student_ID} value={student.Student_ID}>
            {student.Name} (ID: {student.Student_ID}) - {student.Dept_name}
          </option>
        ))}
      </select>
      <button onClick={handleLogin} disabled={!selectedId} className="login-btn">
        View My Classes
      </button>
    </div>
  );
}

// Exporting The Component So it Can Be Used In Other Files.
export default StudentLogin;