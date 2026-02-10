// Import React and React Hooks.
import React, { useState, useEffect } from 'react';
// Import axios Which is Used to Make HTTP Requests to the Backend API.
import axios from 'axios';

// Setting URL for Backend API
const API_URL = 'http://localhost:5000/api';

// Add Course Function
// Requires studentId, semester, year, onAdd and onClose as Input.
function AddCourseModal({ studentId, semester, year, onAdd, onClose }) {
  // Stores List of Available Courses
  const [availableSections, setAvailableSections] = useState([]);
  // Stores List of Course Prequesistes
  const [prerequisites, setPrerequisites] = useState({});
  // Tracks If Data is Loading.
  const [loading, setLoading] = useState(true);
  // Stores The Users Seach Input.
  const [searchTerm, setSearchTerm] = useState('');

  // Runs When searchTerm, semester or year Changes, To Update Page Results.
  useEffect(() => {
    fetchSections();
  }, [searchTerm, semester, year]); // Added dependencies

  // Grab Sections That Are Available from The Backend.
  const fetchSections = async () => {
    try {
      const response = await axios.get(`${API_URL}/sections/available`, {
        params: { semester, year, search: searchTerm }
      });
      setAvailableSections(response.data);
      
      // Fetch prerequisites for each unique course.
      const uniqueCourses = [...new Set(response.data.map(s => s.Course_ID))];
      // Create Request To Fetch Prerequisites for Each Course.
      const prereqPromises = uniqueCourses.map(courseId => 
        axios.get(`${API_URL}/course/${courseId}/prerequisites`)
          .then(res => ({ courseId, prereqs: res.data }))
          .catch(() => ({ courseId, prereqs: [] }))
      );
      
      // Wait For All Prequesite Requests.
      const prereqResults = await Promise.all(prereqPromises);
      // Convert Results Into an Object Map.
      const prereqMap = {};
      prereqResults.forEach(({ courseId, prereqs }) => {
        prereqMap[courseId] = prereqs;
      });
      
      // Save Prerequisites Map to State
      setPrerequisites(prereqMap);
      // Stop Loading Once All is Fetched.
      setLoading(false);
    // In The Case of an Error run console.error and Stop Loading.
    } catch (err) {
      console.error('Error fetching sections:', err);
      setLoading(false);
    }
  };

  // Converts 24 Hour Time Format to 12 Hour Time Format.
  const formatTime = (timeString) => {
    if (!timeString) return 'TBA';
    
    // timeString is now "HH:MM" format from backend
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (hours === 0) return 'TBA';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    
    // Return Reformated Time.
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
  };

  // JSX Returned.
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

// Exporting The Component So it Can Be Used In Other Files.
export default AddCourseModal;