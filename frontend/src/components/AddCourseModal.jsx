import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function AddCourseModal({ studentId, onAdd, onClose }) {
  const [availableSections, setAvailableSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semester] = useState('Winter');
  const [year] = useState(2026);

  useEffect(() => {
    fetchSections();
  }, [searchTerm]);

  const fetchSections = async () => {
    try {
      const response = await axios.get(`${API_URL}/sections/available`, {
        params: { semester, year, search: searchTerm }
      });
      setAvailableSections(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sections:', err);
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
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
                    <p><strong>Instructor:</strong> {section.Instructor_name || 'TBA'}</p>
                    <p><strong>Schedule:</strong> {section.Day || 'TBA'} {formatTime(section.Start_time)}-{formatTime(section.End_time)}</p>
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