// src/components/ReceiptPreview.jsx
import React, { useState } from "react";

export default function ReceiptPreview({ receiptData, onClose }) {
  const [expanded, setExpanded] = useState(false);

  if (!receiptData) return null;

  return (
    <div
      className={`receipt-preview ${expanded ? "expanded" : "mini"}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="receipt-header">
        <h4>Order Receipt</h4>
        {expanded && <button onClick={onClose}>Close</button>}
      </div>
      <div className="receipt-body">
        <p><strong>Name:</strong> {receiptData.name}</p>
        <p><strong>Email:</strong> {receiptData.email}</p>
        <p><strong>Phone:</strong> {receiptData.phone}</p>
        <p><strong>Address:</strong> {receiptData.address}</p>
        <p><strong>Payment:</strong> {receiptData.paymentMethod}</p>
        <ul>
          {receiptData.items.map((item, idx) => (
            <li key={idx}>{item.name} × {item.quantity} — ${item.subtotal.toFixed(2)}</li>
          ))}
        </ul>
        <p><strong>Total:</strong> ${receiptData.total.toFixed(2)}</p>
      </div>
    </div>
  );
}
