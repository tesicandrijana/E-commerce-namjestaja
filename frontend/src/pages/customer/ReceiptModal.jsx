import React from "react";

export default function ReceiptModal({ receipt, onClose }) {
  return (
    <div className="receipt-modal">
      <div className="modal-content">
        <h2>Order Details</h2>
        <p><strong>Name:</strong> {receipt.customer.name}</p>
        <p><strong>Email:</strong> {receipt.customer.email}</p>
        <p><strong>Address:</strong> {receipt.customer.address}</p>
        <p><strong>Phone:</strong> {receipt.customer.phone}</p>
        <h3>Items:</h3>
        <ul>
          {receipt.items.map((item, index) => (
            <li key={index}>
              {item.product.name} x{item.quantity} - ${item.subtotal.toFixed(2)}
            </li>
          ))}
        </ul>
        <h3>Total: ${receipt.total}</h3>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
