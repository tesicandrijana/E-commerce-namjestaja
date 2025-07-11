import React, { useState, useEffect } from "react";
import "./OrderDetailsModal.css";

const OrderDetailsModal = ({ order, onClose }) => {
  const [show, setShow] = useState(!!order); // modal mount control
  const [animateOut, setAnimateOut] = useState(false); // slide out state
  const [discountedPrices, setDiscountedPrices] = useState({}); // Store discounted prices for each product

  useEffect(() => {
    if (order) {
      setShow(true);
      setAnimateOut(false);

      order.items.forEach(async (item) => {
        try {
          const response = await fetch(`http://localhost:8000/products/${item.product.id}/discounted-price`);
          const data = await response.json();
          setDiscountedPrices((prevPrices) => ({
            ...prevPrices,
            [item.product.id]: data.discounted_price,
          }));
        } catch (error) {
          console.error("Error fetching discounted price:", error);
        }
      });
    } else if (show) {
      const timer = setTimeout(() => setShow(false), 350);
      setAnimateOut(true);
      return () => clearTimeout(timer);
    }

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [order, show]);

  if (!show) return null;

  const handleClose = () => {
    setAnimateOut(true);
    setTimeout(onClose, 350); // Wait for animation before closing
  };

  return (
    <div
      className={`order-details-modal-wrapper ${animateOut ? "fade-out" : "fade-in"}`}
      onClick={handleClose}
    >
      <div
        className={`order-details-modal-content ${animateOut ? "slide-out-left" : "slide-in-left"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="order-details-modal-close-btn" onClick={handleClose}>
          &times;
        </span>
        <h2 className="order-details-modal-title">Order #{order.id} Details</h2>

        <div className="order-details-modal-info">
          <strong>Order Date:</strong> {new Date(order.date).toLocaleString()}
        </div>

        <div className="order-details-modal-info">
          <strong>Status:</strong>{" "}
          <span className={`order-details-modal-status order-details-modal-status-${(order.status === "assigned" || order.status === "unassigned" || order.status == null) ? 'pending' : order.status}`}>
            {(order.status === "assigned" || order.status === "unassigned" || order.status == null) ? 'pending' : order.status}
          </span>
        </div>

        <div className="order-details-modal-info">
          <strong>Total Price:</strong> ${order.total_price.toFixed(2)}
        </div>

        {order.items && order.items.length > 0 && (
          <div className="order-details-modal-products-section">
            <h4 style={{ marginBottom: "8px" }}>Products in this Order:</h4>
            <ul className="order-details-modal-products-list">
              {order.items.map((item) => {
                const originalPrice = Number(item.price_per_unit);
                const discountAmount = discountedPrices[item.product.id] || 0;
                const discountedUnitPrice = Math.max(0, originalPrice - discountAmount);
                const totalPrice = discountedUnitPrice * item.quantity;

                return (
                  <li key={item.id} className="order-details-modal-product-item">
                    <div className="order-details-modal-product-name">
                      {item.product?.name || "Unnamed Product"}
                    </div>
                    <div className="order-details-modal-product-detail">
                      Quantity: {item.quantity}
                    </div>
                    <div className="order-details-modal-product-detail">
                      Unit Price: ${originalPrice.toFixed(2)}
                    </div>
                    {discountAmount > 0 && (
                      <>
                        <div className="order-details-modal-product-detail">
                          Discount: ${discountAmount.toFixed(2)} per unit
                        </div>
                        <div className="order-details-modal-product-detail">
                          Discounted Unit Price: ${discountedUnitPrice.toFixed(2)}
                        </div>
                      </>
                    )}
                    <div className="order-details-modal-product-detail">
                      Total: ${totalPrice.toFixed(2)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
