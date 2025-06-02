import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import "./Cart.css";

export default function Cart() {
  const {
    cartItems,
    cartQuantity,
    removeFromCart,
    updateCartItem,
    clearCart,
  } = useCart();

  const [productsMap, setProductsMap] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [plusInput, setPlusInput] = useState(1);
  const [minusInput, setMinusInput] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:8000/products/");
        if (!res.ok) throw new Error("Failed to fetch products");
        const products = await res.json();
        const map = {};
        products.forEach((p) => (map[p.id] = p));
        setProductsMap(map);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!activeItem) return;
    const updated = cartItems.find((item) => item.id === activeItem.id);
    if (updated) {
      setActiveItem({ ...updated, product: activeItem.product });
    }
  }, [cartItems]);

  if (cartItems.length === 0)
    return (
      <p
        style={{
          textAlign: "center",
          paddingTop: "200px",
          marginBottom: "20%",
        }}
      >
        Your cart is empty.
      </p>
    );

  const handlePlus = () => {
    const amount = Math.max(1, parseInt(plusInput) || 1);
    const product = activeItem.product;
    const maxAllowed = product.quantity;

    const newQty = Math.min(activeItem.quantity + amount, maxAllowed);
    updateCartItem(activeItem.id, newQty);
  };

  const handleMinus = () => {
    const amount = Math.max(1, parseInt(minusInput) || 1);
    const newQty = Math.max(1, activeItem.quantity - amount);
    updateCartItem(activeItem.id, newQty);
  };

  return (
    <div className="cart-layout">
      <div className={`cart-container ${activeItem ? "slideout-active" : ""}`}>
        <h2 className="cart-title">Your Cart ({cartQuantity} items)</h2>

        <div className="cart-items">
          {cartItems.map((item, index) => {
            const product = productsMap[item.product_id];
            const imageUrl = product?.images?.[0]?.image_url
              ? `http://localhost:8000/static/product_images/${product.images[0].image_url}`
              : "/placeholder.png";

            return (
              <div
                key={item.id}
                className="cart-item"
                onClick={() => setActiveItem({ ...item, product })}
                style={{ "--index": index }}
              >
                <span className="item-quantity-badge">× {item.quantity}</span>
                <div className="cart-item-image">
                  <img src={imageUrl} alt={product?.name || "Product"} />
                </div>
                <div className="cart-item-info">
                  <strong>{product?.name || item.product_id}</strong>
                  <p>Price: ${Number(product?.price || 0).toFixed(2)}</p>
                  <p>
                    Subtotal: $
                    {(Number(product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-total">
          Total: $
          {cartItems
            .reduce((acc, item) => {
              const product = productsMap[item.product_id];
              const price = Number(product?.price || 0);
              return acc + item.quantity * price;
            }, 0)
            .toFixed(2)}
        </div>

        <button
          className="checkout"
          disabled={cartItems.length === 0}
          onClick={() => navigate("/checkout")}
        >
          Proceed to Checkout
        </button>
      </div>

      {activeItem && (
        <div className={`cart-slideout ${isFadingOut ? "fade-out" : ""}`}>
          <button className="close-slide" onClick={() => setActiveItem(null)}>
            ×
          </button>
          <img
            src={
              activeItem.product?.images?.[0]?.image_url
                ? `http://localhost:8000/static/product_images/${activeItem.product.images[0].image_url}`
                : "/placeholder.png"
            }
            alt="Product"
          />
          <h3>{activeItem.product?.name}</h3>
          <p>Price: ${Number(activeItem.product?.price || 0).toFixed(2)}</p>
          <div className="slide-quantity-custom">
            <div className="qty-block">
              <button className="qty-btn" onClick={handleMinus}>
                −
              </button>
              <input
                type="number"
                min="1"
                max={activeItem.quantity - 1}
                value={minusInput}
                onChange={(e) =>
                  setMinusInput(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </div>

            <span className="qty-current">{activeItem.quantity}</span>

            <div className="qty-block">
              <button className="qty-btn" onClick={handlePlus}>
                +
              </button>
              <input
                type="number"
                min="1"
                max={activeItem.product?.quantity - activeItem.quantity}
                value={plusInput}
                onChange={(e) => {
                  const maxQty = activeItem.product?.quantity || 1;
                  const parsed = parseInt(e.target.value) || 1;
                  setPlusInput(Math.max(1, Math.min(parsed, maxQty)));
                }}
              />
            </div>
          </div>

          <div className="slide-controls">
            <button
              onClick={() => {
                setIsFadingOut(true);
                setTimeout(() => {
                  removeFromCart(activeItem.id);
                  setActiveItem(null);
                  setIsFadingOut(false);
                }, 300); // match CSS animation duration
              }}
            >
              Remove completely
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
