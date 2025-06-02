import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import LoginModal from '../../components/auth/LoginModal'; // import LoginModal component
import RestockModal from '../modals/RestockModal';
import ConfirmModal from '../modals/ConfirmModal';
import AddToCartButton from './AddToCartButton';

function ProductActions({ id, stock }) {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);  // login modal state

  const navigate = useNavigate();

  const onDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/products/${id}/delete`);
      navigate("/products");
    } catch (e) {
      console.error("Failed to delete product:", e);
    }
  };

  return (
    <div className="product-actions">
      {stock === 0 ? (
        <p style={{ color: 'red' }}>Out of stock</p>
      ) : stock < 5 ? (
        <p style={{ color: 'orange' }}>Less than 5 left in stock</p>
      ) : null}

      {isModalOpen && (
        <RestockModal
          id={id}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {currentUser?.role === "manager" && (
        <>
          <button className="action-btn restock-btn" onClick={() => setIsModalOpen(true)}>Restock</button>
          <button className="action-btn edit-product-btn" onClick={() => navigate(`/products/${id}/edit`)}>Edit</button>
          <button className="action-btn delete-product-btn" onClick={() => setIsConfirmModalOpen(true)}>Delete</button>
        </>
      )}

      {(currentUser?.role === "customer" || !currentUser) && (
        <AddToCartButton productId={id} stock={stock} />
      )}

      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          title="Delete Confirmation"
          message={`Are you sure you want to delete this product?`}
          onConfirm={onDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          role="customer"
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </div>
  );
}

export default ProductActions;
