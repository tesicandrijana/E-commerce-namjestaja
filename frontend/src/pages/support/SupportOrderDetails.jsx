import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SupportOrderDetails.css";

const SupportOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:8000/support/orders/${orderId}`, {
        withCredentials: true,
      })
      .then((res) => setOrder(res.data))
      .catch((err) => {
        setError("Failed to fetch order details.");
        console.error(err);
      });
  }, [orderId]);

  if (error) return <p className="error-message">{error}</p>;
  if (!order) return <p className="loading">Loading order...</p>;

  return (
    <div className="order-details-container">
      <button className="back-link" onClick={() => navigate(-1)}>
        ←
      </button>

      <h1 className="title">Order Details #{order.id}</h1>

      <section className="order-section">
        <h3>Status & Payment</h3>
        <div className="order-info-grid">
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Payment Method:</strong> {order.payment_method}</p>
          <p><strong>Payment Status:</strong> {order.payment_status}</p>
          <p><strong>Total:</strong> {order.total_price} BAM</p>
          <p><strong>Transaction ID:</strong> {order.transaction_id || "N/A"}</p>
        </div>
      </section>

      <section className="order-section">
        <h3>Customer Info</h3>
        <div className="order-info-grid">
          <p><strong>Name:</strong> {order.customer.name}</p>
          <p><strong>Email:</strong> {order.customer.email}</p>
          <p><strong>Phone:</strong> {order.customer.phone || "N/A"}</p>
          <p><strong>Address:</strong> {order.customer.address}</p>
        </div>
      </section>

      <section className="order-section">
        <h3>Items</h3>
        <div className="items-list">
          {order.items.map((item, index) => (
            <div key={index} className="item-row">
              <div>
                <p className="item-name">{item.product_name}</p>
                <p className="item-meta">
                  {item.quantity} × {item.price_per_unit} BAM
                </p>
              </div>
              <div className="item-total">{item.total.toFixed(2)} BAM</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SupportOrderDetails;
