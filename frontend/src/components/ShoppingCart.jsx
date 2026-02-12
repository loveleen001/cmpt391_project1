// Import React and React Hooks.
import React, { useState, useEffect } from 'react';
// Import axios Which is Used to Make HTTP Requests to the Backend API.
import axios from 'axios';
// Import AddCourseModal from Components.
import AddCourseModal from './AddCourseModal';

// Setting URL for Backend API
const API_URL = 'http://localhost:5000/api';

// Function for Handling the Shopping Cart.
// Requires studentId, semester, year and onRegisterSuccess as Inputs.
function ShoppingCart({ studentId, semester, year, onRegisterSuccess }) {
  const [cartItems, setCartItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  // Runs fetchCart() Whenever Student, Semester or Year Changes.
  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, semester, year]);

  // Fetch Shopping Cart Items from the Backend.
  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart/${studentId}`, {
        params: { semester, year }
      });
      
      // DON'T FILTER - just show everything
      setCartItems(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setLoading(false);
    }
  };

  // Handles Adding Selected Course Section to The Cart.
  const handleAddToCart = async (section) => {
    try {
      const response = await axios.post(`${API_URL}/cart/add`, {
        studentId,
        sectionId: section.Section_ID
      });

      if (response.data.success) {
        alert(response.data.message);
        // Refresh Cart.
        fetchCart();
        setShowAddModal(false);
      } else {
        alert('Failed to add: ' + response.data.message);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handles Removing Course Section from the Cart.
  const handleRemoveFromCart = async (sectionId) => {
    try {
      const response = await axios.post(`${API_URL}/cart/remove`, {
        studentId,
        sectionId
      });

      if (response.data.success) {
        // Refresh Cart.
        fetchCart();
      } else {
        alert('Failed to remove: ' + response.data.message);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handles Registering All Courses Currently Inside the Cart.
  const handleRegisterAll = async () => {
    // Exits If Cart Is Empty.
    if (cartItems.length === 0) {
      alert('Shopping cart is empty!');
      return;
    }

    // Confirmation Popup on Screen.
    if (!window.confirm(`Register for ${cartItems.length} course(s)?`)) {
      return;
    }

    setRegistering(true);

    try {
      // Extract Section ID's From Cart.
      const sectionIds = cartItems.map(item => item.Section_ID);
      // Make Registration Request To Backend.
      const response = await axios.post(`${API_URL}/register-all`, {
        studentId,
        sectionIds
      });

      const { successCount, failureCount, results } = response.data;

      // Setting Up Summary Message.
      let message = `Registration complete!\n`;
      message += `Success: ${successCount}\n`;
      message += `Failed: ${failureCount}\n\n`;

      // Give Details on Failed Attempts if There are Any.
      if (failureCount > 0) {
        message += 'Failed courses:\n';
        results.filter(r => !r.success).forEach(r => {
          const item = cartItems.find(i => i.Section_ID === r.sectionId);
          message += `- ${item.Course_ID}: ${r.message}\n`;
        });
      }

      alert(message);
      
      // Refresh Cart.
      fetchCart();
      onRegisterSuccess();
    // In The Case of an Error run Alert and Turn setRegistering to False.
    } catch (err) {
      alert('Error during registration: ' + (err.response?.data?.message || err.message));
    } finally {
      setRegistering(false);
    }
  };

  // Converting 24 Hour Format Into 12 Hour Format.
  const formatTime = (timeString) => {
    if (!timeString) return 'TBA';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (hours === 0) return 'TBA';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
  };

  // Show Loading Message While Data is Being Fetched.
  if (loading) {
    return <div className="shopping-cart"><p>Loading cart...</p></div>;
  }

  // JSX Returned.
  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>
      
      <button className="add-course-btn" onClick={() => setShowAddModal(true)}>
        ➕ Add Course
      </button>

      {cartItems.length === 0 ? (
        <p className="empty-cart">Your shopping cart is empty. Add courses to register!</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.Cart_ID} className="cart-item">
                <div>
                  <h4>{item.Course_ID} - {item.Course_name}</h4>
                  <p><strong>Section:</strong> {item.Section_ID} | <strong>Term:</strong> {item.Semester} {item.Year}</p>
                  <p>{item.Instructor_name || 'TBA'} | {item.Day || 'TBA'} {formatTime(item.Start_time)}-{formatTime(item.End_time)}</p>
                  <p>Room: {item.Building}-{item.Room_number} | {item.Available_seats} seats available</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveFromCart(item.Section_ID)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button 
            className="register-btn" 
            onClick={handleRegisterAll}
            disabled={registering}
          >
            {registering ? 'Registering...' : `Register for Selected Courses (${cartItems.length})`}
          </button>
        </>
      )}

      {showAddModal && (
        <AddCourseModal 
          studentId={studentId}
          semester={semester}
          year={year}
          onAdd={handleAddToCart}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// Exporting The Component So it Can Be Used In Other Files.
export default ShoppingCart;