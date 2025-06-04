import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Fetch cart items from backend
  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:8000/cart/", {
        withCredentials: true,
      });
      setCartItems(res.data);
      setCartQuantity(res.data.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartItems([]);
      setCartQuantity(0);
    }
  };

  // Add product to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      // API expects payload { product_id, quantity }
      const res = await axios.post(
        "http://localhost:8000/cart/add",
        { product_id: productId, quantity },
        { withCredentials: true }
      );

      // Update cart items with returned cart item or refetch
      // Here we just refetch full cart for simplicity
      await fetchCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  // Remove cart item by cart_item_id
  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:8000/cart/${cartItemId}`, {
        withCredentials: true,
      });
      setCartItems((prev) => {
        const updated = prev.filter((item) => item.id !== cartItemId);
        setCartQuantity(updated.reduce((sum, item) => sum + item.quantity, 0));
        return updated;
      });
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  // Update quantity of a cart item
  const updateCartItem = async (cartItemId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }
      const res = await axios.patch(
        `http://localhost:8000/cart/${cartItemId}`,
        { quantity },
        { withCredentials: true }
      );
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? res.data : item
        )
      );
      setCartQuantity(
        cartItems.reduce((sum, item) =>
          item.id === cartItemId ? sum + quantity : sum + item.quantity, 0)
      );
    } catch (error) {
      console.error("Failed to update cart item:", error);
    }
  };

  // Clear local cart state
  const clearCart = async () => {
  try {
    await axios.delete("http://localhost:8000/cart/clear", { withCredentials: true });
    setCartItems([]);
    setCartQuantity(0);
  } catch (error) {
    console.error("Failed to clear cart:", error);
  }
};

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartQuantity,
        fetchCart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}