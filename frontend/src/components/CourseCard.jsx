// Import React and useState Hook.
import React, { useState } from 'react';

// Function for Returning a CourseCard Component, Used in ClassList.jsx
// Requires course and status as Input.
function CourseCard({ course, status }) {
  // Controls Wether The Course Details are Visible or Not (Expanded vs Collapsed).
  const [expanded, setExpanded] = useState(true);

  // Formats Time String To HH:MM Format.
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  // JSX Returned.
  return (
    <div className="course-card">
      <div className="course-header" onClick={() => setExpanded(!expanded)}>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
        <h3>
          {course.Course_ID} {course.Course_name}
          <span className="term-tag">
            ({course.Semester} {course.Year} · Section {course.Section_ID})
          </span>
        </h3>
      </div>

      {expanded && (
        <div className="course-details">
          <div className="course-info-grid">
            <div className="info-row">
              <strong>Status:</strong> 
              <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
            </div>
            <div className="info-row">
              <strong>Units:</strong> {course.Credits}.00
            </div>
            {course.Grade && (
              <div className="info-row">
                <strong>Grade:</strong> {course.Grade}
              </div>
            )}
          </div>

          <div className="class-section">
            <h4>Class</h4>
            <div className="section-details">
              <p><strong>Instructor:</strong> {course.Instructor_name || 'TBA'}</p>
              <p><strong>Days and Times:</strong> {course.Day || 'TBA'} {formatTime(course.Start_time)} to {formatTime(course.End_time)}</p>
              <p><strong>Room:</strong> {course.Building}-{course.Room_number}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Exporting The Component So it Can Be Used In Other Files.
export default CourseCard;