import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useCart } from "../../contexts/CartContext";
import LoginModal from "../auth/LoginModal";
import UniversalModal from "./UniversalModal";
import { FaShoppingCart } from "react-icons/fa";

function AddToCartButton({ productId, stock, iconOnly = false }) {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modal state for success/error messages
  const [modalData, setModalData] = useState({
    isOpen: false,
    type: "success", // or "error"
    title: "",
    message: "",
  });

  const closeModal = () => {
    setModalData((prev) => ({ ...prev, isOpen: false }));
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    if (currentUser.role !== "customer") {
      setModalData({
        isOpen: true,
        type: "error",
        title: "Access Denied",
        message: "Only customers can add products to cart.",
      });
      return;
    }

    try {
      await addToCart(productId, 1);
      setModalData({
        isOpen: true,
        type: "success",
        title: "Added to Cart",
        message: "Product was added to your cart successfully!",
      });
    } catch (error) {
      console.error("Add to cart failed:", error);
      setModalData({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to add product to cart.",
      });
    }
  };

  return (
    <>
      <button
        className={iconOnly ? "icon-only-cart-btn" : "add-to-cart-btn"}
        disabled={stock === 0}
        title={stock === 0 ? "Out of stock" : "Add to Cart"}
        onClick={handleAddToCart}
      >
        {iconOnly ? (
          <FaShoppingCart />
        ) : stock === 0 ? (
          "Out of Stock"
        ) : (
          <>
            <FaShoppingCart style={{ marginRight: "5px" }} />
            Add to Cart
          </>
        )}
      </button>

      {isLoginModalOpen && (
        <LoginModal role="customer" onClose={() => setIsLoginModalOpen(false)} />
      )}

      <UniversalModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        type={modalData.type}
        title={modalData.title}
        message={modalData.message}
      />
    </>
  );
}

export default AddToCartButton;
