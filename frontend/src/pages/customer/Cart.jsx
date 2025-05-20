import React from "react";
import { useCart } from "../../contexts/CartContext";
import "./Cart.css";

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, clearCart, cartQuantity } = useCart();

  if (cartItems.length === 0) {
    return <div className="cart-empty">Your cart is empty.</div>;
  }

  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>
      <ul className="cart-list">
        {cartItems.map((item) => (
          <li key={item.id} className="cart-item">
            <img
              src={item.image ? `http://localhost:8000/static/product_images/${item.image}` : ""}
              alt={item.name}
              className="cart-item-image"
            />
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p>Price: ${item.price?.toFixed(2)}</p>
              <p>Quantity: {item.quantity}</p>
              <div className="cart-item-actions">
                <button onClick={() => removeFromCart(item.id)}>-</button>
                <button onClick={() => addToCart(item)}>+</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <p>Total items: {cartQuantity}</p>
        <button className="clear-cart-btn" onClick={clearCart}>
          Clear Cart
        </button>
      </div>
    </div>
  );
}
