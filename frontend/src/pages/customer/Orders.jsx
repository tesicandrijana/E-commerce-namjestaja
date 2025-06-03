import React, { useEffect, useState } from "react";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/orders/myorders", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to fetch orders");
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const cancelOrder = (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    fetch(`http://localhost:8000/orders/cancel/${orderId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to cancel order");
        }
        return res.json();
      })
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "cancelled" } : order
          )
        );
      })
      .catch((err) => {
        alert(`Error: ${err.message}`);
      });
  };

  if (error) {
    return <div className="orders-error">Unable to load orders: {error}</div>;
  }

  if (!orders.length) {
    return <div className="orders-empty">No orders found.</div>;
  }

  return (
    <div className="orders-background">
    <div className="orders-container">
      <h2 className="orders-heading">Your Orders</h2>
      <ul className="orders-list">
        {orders.map((order, index) => (
          <li key={order.id} className="orders-item">
            <div className="order-info">
              <span className="order-number">Order #{index + 1}</span>
              <span className="order-date">{formatDateTime(order.date)}</span>
            </div>
            <div className="order-meta">
              <div>
                <span className="order-status">{order.status}</span> —{" "}
                <span className="order-total">
                  ${order.total_price ? order.total_price.toFixed(2) : "N/A"}
                </span>
              </div>
              {order.status === "pending" && (
                <button
                  className="cancel-button"
                  onClick={() => cancelOrder(order.id)}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}