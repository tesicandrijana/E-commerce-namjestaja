// src/components/common/AddToCartButton.jsx
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../../contexts/CartContext';
import LoginModal from '../auth/LoginModal';
import { FaShoppingCart } from 'react-icons/fa';

function AddToCartButton({ productId, stock, iconOnly = false }) {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleAddToCart = async () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    if (currentUser.role !== 'customer') {
      alert("Only customers can add products to cart.");
      return;
    }

    try {
      await addToCart(productId, 1);
      alert("Added to cart!");
    } catch (error) {
      console.error("Add to cart failed:", error);
      alert("Failed to add product to cart.");
    }
  };

  return (
    <>
      <button
  className={iconOnly ? "icon-only-cart-btn" : "add-to-cart-btn"}
  disabled={stock === 0}
  title={stock === 0 ? 'Out of stock' : 'Add to Cart'}
  onClick={handleAddToCart}
>
  {iconOnly ? (
    <FaShoppingCart />
  ) : stock === 0 ? (
    'Out of Stock'
  ) : (
    <>
      <FaShoppingCart style={{ marginRight: '5px' }} />
      Add to Cart
    </>
  )}
</button>

      {isLoginModalOpen && (
        <LoginModal
          role="customer"
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </>
  );
}

export default AddToCartButton;
