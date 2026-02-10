// Import React and React Hooks.
import React, { useState, useEffect } from 'react';
// Import axios Which is Used to Make HTTP Requests to the Backend API.
import axios from 'axios';
// Import CourseCard from Components.
import CourseCard from './CourseCard';

// Setting URL for Backend API
const API_URL = 'http://localhost:5000/api';

// Function for Retrieving Class List.
// Requires studentId, semester and year as Input.
function ClassList({ studentId, semester, year }) {
  // Stores The Enrolled and Completed Classes of a Student.
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  // Tracks If Data is Loading.
  const [loading, setLoading] = useState(true);
  // Controls if Enrolled and Completed Classes are Shown.
  const [showEnrolled, setShowEnrolled] = useState(true);

  // Runs When studentId, semester or year Changes, To Update Page Results.
  useEffect(() => {
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, semester, year]);

  // Fetch a Students Schedule from Backend.
  const fetchSchedule = async () => {
    try {
      // API Request for a Students Schedule Based on Semester and Year.
      const response = await axios.get(
        `${API_URL}/student/${studentId}/schedule`,
        { params: { semester, year } }
      );
      // Save Schedule Data To State.
      setEnrolledClasses(response.data);
      // Turn Off Loading Once Data Received.
      setLoading(false);
    // In The Case of an Error run console.error and Stop Loading.
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setLoading(false);
    }
  };

  // Displays Loading Message on Screen While Data is Being Fetched.
  if (loading) {
    return <div className="class-list"><p>Loading schedule...</p></div>;
  }

  // Filter Classes that Student is Enrolled in Currently.
  const currentClasses = enrolledClasses.filter(c => c.Grade === null);
  // Filter Classes a Student has Completed.
  const completedClasses = enrolledClasses.filter(c => c.Grade !== null);

  // JSX Returned.
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

      {showEnrolled && (
        <div className="classes-container">
          <h3>Currently Enrolled ({currentClasses.length})</h3>
          {currentClasses.length === 0 ? (
            <p className="no-classes">No current enrollments</p>
          ) : (
            currentClasses.map(course => (
              <CourseCard key={course.Section_ID} course={course} status="Enrolled" />
            ))
          )}

          <h3 style={{ marginTop: '30px' }}>
            Completed Courses ({completedClasses.length})
          </h3>
          {completedClasses.length === 0 ? (
            <p className="no-classes">No completed courses</p>
          ) : (
            completedClasses.map(course => (
              <CourseCard key={course.Section_ID} course={course} status="Completed" />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Exporting The Component So it Can Be Used In Other Files.
export default ClassList;
