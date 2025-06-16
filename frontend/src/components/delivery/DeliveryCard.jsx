import React from "react";

const DeliveryCard = ({ delivery, onMarkDelivered }) => {
  return (
    <div className={`support-card delivery-card ${delivery.status}`}>
      <h3 className="support-card-title">Order #{delivery.order_id}</h3>
      <p><strong>Status:</strong> {delivery.status}</p>
      <p><strong>Date:</strong> {delivery.date ? new Date(delivery.date).toLocaleString() : "N/A"}</p>

      {delivery.status !== "delivered" && (
        <button
          className="support-card-button"
          onClick={() => onMarkDelivered(delivery.id)}
        >
          Mark as Delivered
        </button>
      )}
    </div>
  );
};

export default DeliveryCard;
