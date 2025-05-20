import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const CartContext = createContext();

// Custom hook for easier usage
export const useCart = () => useContext(CartContext);

// Provider component
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Fetch current cart items from backend on mount (adjust URL as needed)
  useEffect(() => {
    fetch('http://localhost:8000/cart/')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cart');
        return res.json();
      })
      .then(data => {
        // Expecting data to be array like [{ id, name, ..., quantity }, ...]
        setCartItems(data);
      })
      .catch(err => {
        console.error('Error fetching cart items:', err);
      });
  }, []);

  // Add product to cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Check if product is already in cart
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        // Increase quantity
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add new product with quantity 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Remove one quantity of product from cart (or remove if quantity is 1)
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Clear all items from cart
  const clearCart = () => setCartItems([]);

  // Get total number of items in cart
  const cartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, cartQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

