import React, { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";

const Cart = () => {
  const { cartItems } = useCart();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Optionally fetch cart data from API on mount
    setLoading(false);
  }, []);

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index}>
                {/* Ensure product is defined before accessing its properties */}
                {item.product ? (
                  <>
                    <p>{item.product.name}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.product.price * item.quantity}</p>
                  </>
                ) : (
                  <p>Invalid product data</p>
                )}
              </li>
            ))}
          </ul>
          {/* Optionally add a checkout button */}
        </div>
      )}
    </div>
  );
};

export default Cart;
