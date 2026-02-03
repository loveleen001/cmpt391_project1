import React, { useState, useEffect } from 'react';

function AddCourseModal({ studentId, onAdd, onClose }) {
  const [availableSections, setAvailableSections] = useState([]);

  useEffect(() => {
    // Mock available sections - in Phase 3, fetch from database
    const mockSections = [
      {
        Section_ID: 4,
        Course_ID: 'CMPT301',
        Course_name: 'Database Management Systems',
        Credits: 3,
        Instructor: 'Dr. Emily Rodriguez',
        Day: 'Wednesday',
        Start_time: '08:00',
        End_time: '09:30',
        Building: 'Building A',
        Room_number: '102',
        Available_seats: 30
      },
      {
        Section_ID: 5,
        Course_ID: 'MATH101',
        Course_name: 'Calculus I',
        Credits: 3,
        Instructor: 'Dr. Robert Smith',
        Day: 'Wednesday',
        Start_time: '10:00',
        End_time: '11:30',
        Building: 'Building B',
        Room_number: '101',
        Available_seats: 30
      }
    ];
    setAvailableSections(mockSections);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add Course</h2>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="available-sections">
          {availableSections.map(section => (
            <div key={section.Section_ID} className="section-item">
              <div>
                <h4>{section.Course_ID} - {section.Course_name}</h4>
                <p>{section.Instructor}</p>
                <p>{section.Day} {section.Start_time}-{section.End_time}</p>
                <p>Room: {section.Building}-{section.Room_number}</p>
                <p className="seats-available">
                  {section.Available_seats} seats available
                </p>
              </div>
              <button 
                className="add-btn"
                onClick={() => onAdd(section)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddCourseModal;