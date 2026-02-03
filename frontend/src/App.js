import React, { useState } from 'react';
import './App.css';
import StudentLogin from './components/StudentLogin';
import ClassList from './components/ClassList';
import ShoppingCart from './components/ShoppingCart';

function App() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('enrolled');

  return (
    <div className="App">
      <header className="app-header">
        <h1>View My Classes</h1>
      </header>

      <div className="term-info">
        <h2>2026 Winter Term</h2>
        <p>Undergraduate</p>
      </div>

      {!selectedStudent ? (
        <StudentLogin onSelectStudent={setSelectedStudent} />
      ) : (
        <div className="main-content">
          <div className="navigation-tabs">
            <button 
              className={activeTab === 'enrolled' ? 'active' : ''}
              onClick={() => setActiveTab('enrolled')}
            >
              📅 View My Classes/Schedule
            </button>
            <button 
              className={activeTab === 'cart' ? 'active' : ''}
              onClick={() => setActiveTab('cart')}
            >
              🛒 Shopping Cart
            </button>
          </div>

          <div className="student-info">
            <p><strong>Student:</strong> {selectedStudent.Name}</p>
            <p><strong>Total Credits:</strong> {selectedStudent.Total_cred}</p>
            <p><strong>Department:</strong> {selectedStudent.Dept_name}</p>
          </div>

          {activeTab === 'enrolled' ? (
            <ClassList studentId={selectedStudent.Student_ID} />
          ) : (
            <ShoppingCart studentId={selectedStudent.Student_ID} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;