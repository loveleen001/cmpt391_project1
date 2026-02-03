import React, { useState, useEffect } from 'react';
import AddCourseModal from './AddCourseModal';

function ShoppingCart({ studentId }) {
  const [cartItems, setCartItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddToCart = (section) => {
    setCartItems([...cartItems, section]);
    setShowAddModal(false);
  };

  const handleRemoveFromCart = (sectionId) => {
    setCartItems(cartItems.filter(item => item.Section_ID !== sectionId));
  };

  const handleRegister = () => {
    alert(`Registering for ${cartItems.length} course(s)...`);
    // In Phase 3, we'll call the sp_RegisterStudent stored procedure
  };

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
              <div key={item.Section_ID} className="cart-item">
                <div>
                  <h4>{item.Course_ID} - {item.Course_name}</h4>
                  <p>{item.Instructor} | {item.Day} {item.Start_time}-{item.End_time}</p>
                  <p>Room: {item.Building}-{item.Room_number}</p>
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

          <button className="register-btn" onClick={handleRegister}>
            Register for Selected Courses ({cartItems.length})
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