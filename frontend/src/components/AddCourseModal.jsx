import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function AddCourseModal({ studentId, semester, year, onAdd, onClose }) {
  const [availableSections, setAvailableSections] = useState([]);
  const [prerequisites, setPrerequisites] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // REMOVED: const [semester] = useState('Winter');
  // REMOVED: const [year] = useState(2026);

  useEffect(() => {
    fetchSections();
  }, [searchTerm, semester, year]); // Added dependencies

  const fetchSections = async () => {
    try {
      const response = await axios.get(`${API_URL}/sections/available`, {
        params: { semester, year, search: searchTerm }
      });
      setAvailableSections(response.data);
      
      // Fetch prerequisites for each unique course
      const uniqueCourses = [...new Set(response.data.map(s => s.Course_ID))];
      const prereqPromises = uniqueCourses.map(courseId => 
        axios.get(`${API_URL}/course/${courseId}/prerequisites`)
          .then(res => ({ courseId, prereqs: res.data }))
          .catch(() => ({ courseId, prereqs: [] }))
      );
      
      const prereqResults = await Promise.all(prereqPromises);
      const prereqMap = {};
      prereqResults.forEach(({ courseId, prereqs }) => {
        prereqMap[courseId] = prereqs;
      });
      
      setPrerequisites(prereqMap);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sections:', err);
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBA';
    
    // timeString is now "HH:MM" format from backend
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (hours === 0) return 'TBA';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add Course - {semester} {year}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search courses (e.g., CMPT, Database, etc.)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <p>Loading available sections...</p>
        ) : (
          <div className="available-sections">
            {availableSections.length === 0 ? (
              <p className="no-results">No available sections found. Try a different search.</p>
            ) : (
              availableSections.map(section => (
                <div key={section.Section_ID} className="section-item">
                  <div>
                    <h4>{section.Course_ID} - {section.Course_name}</h4>
                    
                    {/* Show Prerequisites */}
                    {prerequisites[section.Course_ID] && prerequisites[section.Course_ID].length > 0 && (
                      <p className="prerequisites-info">
                        <strong>Prerequisites:</strong> {prerequisites[section.Course_ID].map(p => p.Prereq_course_ID).join(', ')}
                      </p>
                    )}
                    
                    <p><strong>Instructor:</strong> {section.Instructor_name || 'TBA'}</p>
                    <p><strong>Schedule:</strong> {section.Day || 'TBA'} {formatTime(section.Start_time)} - {formatTime(section.End_time)}</p>
                    <p><strong>Room:</strong> {section.Building}-{section.Room_number}</p>
                    <p className="seats-available">
                      {section.Available_seats} seats available (out of {section.Max_enrollment})
                    </p>
                  </div>
                  <button 
                    className="add-btn"
                    onClick={() => onAdd(section)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddCourseModal;