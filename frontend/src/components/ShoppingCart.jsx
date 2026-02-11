import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddCourseModal from './AddCourseModal';

const API_URL = 'http://localhost:5000/api';

function ShoppingCart({ studentId, onRegisterSuccess }) {
  const [cartItems, setCartItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [studentId]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart/${studentId}`);
      setCartItems(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setLoading(false);
    }
  };

  const handleAddToCart = async (section) => {
    try {
      const response = await axios.post(`${API_URL}/cart/add`, {
        studentId,
        sectionId: section.Section_ID
      });

      if (response.data.success) {
        alert(response.data.message);
        fetchCart();
        setShowAddModal(false);
      } else {
        alert('Failed to add: ' + response.data.message);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveFromCart = async (sectionId) => {
    try {
      const response = await axios.post(`${API_URL}/cart/remove`, {
        studentId,
        sectionId
      });

      if (response.data.success) {
        fetchCart();
      } else {
        alert('Failed to remove: ' + response.data.message);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRegisterAll = async () => {
    if (cartItems.length === 0) {
      alert('Shopping cart is empty!');
      return;
    }

    if (!window.confirm(`Register for ${cartItems.length} course(s)?`)) {
      return;
    }

    setRegistering(true);

    try {
      const sectionIds = cartItems.map(item => item.Section_ID);
      const response = await axios.post(`${API_URL}/register-all`, {
        studentId,
        sectionIds
      });

      const { successCount, failureCount, results } = response.data;

      let message = `Registration complete!\n`;
      message += `✅ Success: ${successCount}\n`;
      message += `❌ Failed: ${failureCount}\n\n`;

      if (failureCount > 0) {
        message += 'Failed courses:\n';
        results.filter(r => !r.success).forEach(r => {
          const item = cartItems.find(i => i.Section_ID === r.sectionId);
          message += `- ${item.Course_ID}: ${r.message}\n`;
        });
      }

      alert(message);
      
      fetchCart();
      onRegisterSuccess();
    } catch (err) {
      alert('Error during registration: ' + (err.response?.data?.message || err.message));
    } finally {
      setRegistering(false);
    }
  };

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

  if (loading) {
    return <div className="shopping-cart"><p>Loading cart...</p></div>;
  }

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
          onAdd={handleAddToCart}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

export default ShoppingCart;
