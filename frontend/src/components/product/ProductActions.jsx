import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestockModal from '../modals/RestockModal';
import ConfirmModal from '../modals/ConfirmModal';
import ProductForm from './ProductForm';
import AddToCartButton from '../modals/AddToCartButton';

function ProductActions({ id, stock, fetchProduct, fetchProducts }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editFormDrawerOpen, setIsEditFormDrawerOpen] = useState(false);

  const openEditDrawer = () => {
    setIsEditFormDrawerOpen(true);
  }


  const onDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/products/${id}`);
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
          fetchProduct={fetchProduct}
          fetchProducts={fetchProducts}
        />
      )}
      {currentUser?.role === "manager" && (

        <>
          <button className="action-btn restock-btn" onClick={() => setIsModalOpen(true)}>Restock</button>
          <button className="action-btn edit-product-btn" onClick={openEditDrawer}>Edit</button>
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
        <ProductForm mode={"edit"} id={id} open={editFormDrawerOpen} onClose={() => setIsEditFormDrawerOpen(false)} fetchProduct2={fetchProduct} />
    </div>
  );
}

export default ProductActions;





