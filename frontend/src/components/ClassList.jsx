import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';

function ClassList({ studentId }) {
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [showEnrolled, setShowEnrolled] = useState(true);

  useEffect(() => {
    // Mock data - in Phase 3 we'll fetch from database
    const mockClasses = {
      1: [ // Alice's classes
        {
          Section_ID: 1,
          Course_ID: 'CMPT101',
          Course_name: 'Introduction to Programming',
          Credits: 3,
          Instructor: 'Dr. Sarah Johnson',
          Day: 'Monday',
          Start_time: '08:00',
          End_time: '09:30',
          Building: 'Building A',
          Room_number: '101',
          Grade: 'A'
        },
        {
          Section_ID: 2,
          Course_ID: 'CMPT102',
          Course_name: 'Data Structures',
          Credits: 3,
          Instructor: 'Prof. Michael Chen',
          Day: 'Monday',
          Start_time: '10:00',
          End_time: '11:30',
          Building: 'Building A',
          Room_number: '102',
          Grade: 'B+'
        },
        {
          Section_ID: 3,
          Course_ID: 'CMPT201',
          Course_name: 'Algorithms',
          Credits: 3,
          Instructor: 'Dr. Sarah Johnson',
          Day: 'Monday',
          Start_time: '12:00',
          End_time: '13:30',
          Building: 'Building A',
          Room_number: '101',
          Grade: null // Currently enrolled
        }
      ],
      2: [ // Bob's classes
        {
          Section_ID: 1,
          Course_ID: 'CMPT101',
          Course_name: 'Introduction to Programming',
          Credits: 3,
          Instructor: 'Dr. Sarah Johnson',
          Day: 'Monday',
          Start_time: '08:00',
          End_time: '09:30',
          Building: 'Building A',
          Room_number: '101',
          Grade: 'B'
        }
      ]
    };

    setEnrolledClasses(mockClasses[studentId] || []);
  }, [studentId]);

  const currentClasses = enrolledClasses.filter(c => c.Grade === null);
  const completedClasses = enrolledClasses.filter(c => c.Grade !== null);

  return (
    <div className="class-list">
      <div className="filter-options">
        <label>
          <input 
            type="checkbox" 
            checked={showEnrolled} 
            onChange={(e) => setShowEnrolled(e.target.checked)}
          />
          Show Enrolled Classes
        </label>
      </div>

      <div className="classes-container">
        <h3>Currently Enrolled ({currentClasses.length})</h3>
        {currentClasses.map(course => (
          <CourseCard key={course.Section_ID} course={course} status="Enrolled" />
        ))}

        <h3 style={{marginTop: '30px'}}>Completed Courses ({completedClasses.length})</h3>
        {completedClasses.map(course => (
          <CourseCard key={course.Section_ID} course={course} status="Completed" />
        ))}
      </div>
    </div>
  );
}

export default ClassList;