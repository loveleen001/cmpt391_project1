    import React, { useState, useEffect } from 'react';

function StudentLogin({ onSelectStudent }) {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    // Hardcoded student data from our database
    // In Phase 3, we'll fetch this from the actual database
    const mockStudents = [
      { Student_ID: 1, Name: 'Alice Thompson', Total_cred: 45, Dept_name: 'Computer Science' },
      { Student_ID: 2, Name: 'Bob Martinez', Total_cred: 30, Dept_name: 'Computer Science' },
      { Student_ID: 3, Name: 'Charlie Davis', Total_cred: 60, Dept_name: 'Computer Science' },
      { Student_ID: 4, Name: 'Diana Wilson', Total_cred: 15, Dept_name: 'Computer Science' },
      { Student_ID: 5, Name: 'Ethan Brown', Total_cred: 75, Dept_name: 'Computer Science' }
    ];
    setStudents(mockStudents);
  }, []);

  const handleLogin = () => {
    const student = students.find(s => s.Student_ID === parseInt(selectedId));
    if (student) {
      onSelectStudent(student);
    }
  };

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
            {student.Name} (ID: {student.Student_ID})
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