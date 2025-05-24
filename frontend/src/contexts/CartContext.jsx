import React, { createContext, useContext, useState, useEffect } from "react";

// Create the Cart context
const CartContext = createContext();

// Hook to access cart context easily
export function useCart() {
  return useContext(CartContext);
}

// CartProvider component that holds cart state and functions
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Fetch initial cart items on mount (optional)
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("http://localhost:8000/cart");
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCartItems(data);
      } catch (error) {
        console.error("Fetch cart error:", error);
      }
    }
    fetchCart();
  }, []);

  // Add product to cart, or increase quantity if already exists
  async function addToCart(product, quantity = 1) {
    try {
      const response = await fetch("http://localhost:8000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth token here if needed
        },
        body: JSON.stringify({ product_id: product.id, quantity }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.statusText}`);
      }

      const updatedCartItem = await response.json();

      setCartItems((prevItems) => {
        const index = prevItems.findIndex(
          (item) => item.product_id === updatedCartItem.product_id
        );
        if (index >= 0) {
          // Update existing item
          const newItems = [...prevItems];
          newItems[index] = updatedCartItem;
          return newItems;
        } else {
          // Add new item
          return [...prevItems, updatedCartItem];
        }
      });
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  }

  // Remove item from cart
  async function removeFromCart(productId) {
    try {
      const response = await fetch(`http://localhost:8000/cart/remove/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to remove from cart: ${response.statusText}`);
      }

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product_id !== productId)
      );
    } catch (error) {
      console.error("Remove from cart error:", error);
    }
  }

  // Update quantity of a cart item
  async function updateCartItem(productId, quantity) {
    try {
      const response = await fetch(`http://localhost:8000/cart/update/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update cart item: ${response.statusText}`);
      }

      const updatedCartItem = await response.json();

      setCartItems((prevItems) => {
        const index = prevItems.findIndex((item) => item.product_id === productId);
        if (index >= 0) {
          const newItems = [...prevItems];
          newItems[index] = updatedCartItem;
          return newItems;
        }
        return prevItems;
      });
    } catch (error) {
      console.error("Update cart item error:", error);
    }
  }

  // Clear the entire cart
  async function clearCart() {
    try {
      const response = await fetch(`http://localhost:8000/cart/clear`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed to clear cart: ${response.statusText}`);
      }

      setCartItems([]);
    } catch (error) {
      console.error("Clear cart error:", error);
    }
  }

  // Context value that will be available to all components using useCart()
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
