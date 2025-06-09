import React, { useState, useEffect } from "react";
import "./OrderSummaryModal.css";

export default function OrderDetailsModal({ open, onClose, orderDetails, cartItems, productNames }) {
  const [discountedPrices, setDiscountedPrices] = useState({}); // Store discounted prices for each product

  useEffect(() => {
    // Fetch discounted price for each product in the order
    if (orderDetails && orderDetails.items) {
      orderDetails.items.forEach(async (item) => {
        try {
          const response = await fetch(`http://localhost:8000/products/${item.product_id}/discounted-price`);
          const data = await response.json();
          setDiscountedPrices((prevPrices) => ({
            ...prevPrices,
            [item.product_id]: data.discounted_price,
          }));
        } catch (error) {
          console.error("Error fetching discounted price:", error);
        }
      });
    }
  }, [orderDetails]);

  if (!open || !orderDetails) return null;

  // Group items by product_id and sum the quantities
  const groupedItems = orderDetails.items.reduce((acc, item) => {
    const { product_id, quantity, price_per_unit } = item;
    const existingItem = acc.find((i) => i.product_id === product_id);
    if (existingItem) {
      existingItem.quantity += quantity; // Increase quantity if the product already exists
    } else {
      acc.push({ product_id, quantity, price_per_unit });
    }
    return acc;
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Order Placed Successfully</h2>
        <p><strong>Order ID:</strong> {orderDetails.id}</p>
        <p><strong>Name:</strong> {orderDetails.name}</p>
        <p><strong>Email:</strong> {orderDetails.email}</p>
        <p><strong>Address:</strong> {orderDetails.address}, {orderDetails.city}, {orderDetails.postal_code}</p>
        <p><strong>Phone:</strong> {orderDetails.phone}</p>
        <p><strong>Payment:</strong> {orderDetails.payment_method}</p>

        <h3>Order Items:</h3>
        {groupedItems && groupedItems.length > 0 ? (
          <ul className="order-items-list">
            {groupedItems.map((item) => {
              const originalPrice = Number(item.price_per_unit);
              const discountAmount = discountedPrices[item.product_id] || 0;
              const discountedUnitPrice = Math.max(0, originalPrice - discountAmount);
              const totalPrice = discountedUnitPrice * item.quantity;

              return (
                <li key={item.product_id}>
                  <span>{productNames[item.product_id] || `Product #${item.product_id}`}</span> – 
                  <span> {item.quantity} × ${originalPrice.toFixed(2)}</span>
                  {discountAmount > 0 && (
                    <>
                      <div className="product-discount">
                        Discount: ${discountAmount.toFixed(2)} per unit
                      </div>
                      <div className="product-discounted-price">
                        Discounted Price: ${discountedUnitPrice.toFixed(2)} per unit
                      </div>
                    </>
                  )}
                  <div className="product-total-price">
                    Total: ${totalPrice.toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No items in this order.</p>
        )}

        <div className="order-total">
          <p><strong>Subtotal:</strong> ${orderDetails.subtotal.toFixed(2)}</p>
          <p><strong>Tax:</strong> ${orderDetails.tax.toFixed(2)}</p>
          <p><strong>Shipping:</strong> ${orderDetails.shipping_cost.toFixed(2)}</p>
          <p><strong>Total:</strong> ${orderDetails.total_price.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
