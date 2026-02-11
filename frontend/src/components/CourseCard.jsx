import React, { useState } from 'react';

function CourseCard({ course, status }) {
  const [expanded, setExpanded] = useState(true);

  const formatTime = (value) => {
    if (!value) return 'TBA';

    // If backend returns Date object
    if (value instanceof Date) {
      return value.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // If backend returns string like "1970-01-01T08:00:00.000Z"
    if (typeof value === 'string' && value.includes('T')) {
      return value.substring(11, 16);
    }

    // If backend returns "08:00:00"
    return value.substring(0, 5);
  };

  return (
    <div className="course-card">
      <div className="course-header" onClick={() => setExpanded(!expanded)}>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
        <h3>{course.Course_ID} {course.Course_name}</h3>
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

export default CourseCard;
