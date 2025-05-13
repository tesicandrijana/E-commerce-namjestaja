import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductActions({ id }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const onDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/products/${id}`);
      navigate("/products");
    } catch (e) {
      console.error("Failed to delete product:", e);
    }
  };

  const onEdit = () => {
    navigate(`/products/${id}/edit`);
  };

  return (
    <div className="product-actions">
      {currentUser?.role === "manager" && (
        <>
          <button className="action-btn edit-btn" onClick={onEdit}>Edit</button>
          <button className="action-btn delete-btn" onClick={onDelete}>Delete</button>
        </>
      )}

      {currentUser?.role === "customer" && (
        <button className="action-btn add-to-cart-btn">Add to cart</button>
      )}
    </div>
  );
}

export default ProductActions;
