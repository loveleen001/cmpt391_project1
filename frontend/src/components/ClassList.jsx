import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CourseCard from './CourseCard';

const API_URL = 'http://localhost:5000/api';

function ClassList({ studentId, semester, year }) {
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrolled, setShowEnrolled] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [studentId, semester, year]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/student/${studentId}/schedule`,
        { params: { semester, year } }
      );
      setEnrolledClasses(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="class-list"><p>Loading schedule...</p></div>;
  }

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

export default ClassList;
