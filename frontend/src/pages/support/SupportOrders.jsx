import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SupportOrders.css";

const SupportOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/support/orders", {
        withCredentials: true,
      })
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders.");
      });
  }, []);

  if (error) return <p className="error-message">{error}</p>;
  if (!orders.length) return <p className="loading">No orders available.</p>;

  return (
    <div className="orders-container">
      <button className="back-link" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1 className="title">Customer Orders</h1>
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer.name}</td>
                <td>{order.customer.email}</td>
                <td>
                  <span className={`status-badge ${order.status.replace(/\s/g, "_")}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.total_price} BAM</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <Link to={`/support/orders/${order.id}`} className="view-btn">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupportOrders;
