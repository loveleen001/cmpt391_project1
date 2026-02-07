import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function StudentLogin({ onSelectStudent }) {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Make sure backend is running on port 5000.');
      setLoading(false);
    }
  };

  const handleLogin = () => {
    const student = students.find(s => s.Student_ID === parseInt(selectedId));
    if (student) {
      onSelectStudent(student);
    }
  };

  if (loading) {
    return (
      <div className="student-login">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-login">
        <h2>Error</h2>
        <p style={{color: 'red'}}>{error}</p>
        <button onClick={fetchStudents}>Retry</button>
      </div>
    );
  }

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

export default StudentLogin;