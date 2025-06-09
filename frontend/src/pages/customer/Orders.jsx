import React, { useEffect, useState } from "react";
import ComplaintModal from "./ComplaintModal";
import OrderDetailsModal from "./OrderDetailsModal";
import "./OrdersTrack.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [showComplaint, setShowComplaint] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [preferred_resolution, setPreferredResolution] = useState("");
  const [message, setMessage] = useState("");
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/orders/myorders", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to fetch orders");
        }
        return res.json();
      })
      .then(setOrders)
      .catch((err) => setError(err.message));
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
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to cancel order");
        }
        return res.json();
      })
      .then(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" } : o
          )
        );
      })
      .catch((err) => alert(`Error: ${err.message}`));
  };

  const removeOrder = (orderId) => {
    if (!window.confirm("Remove this cancelled order permanently?")) return;

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const openComplaint = (orderId) => {
    setSelectedOrderId(orderId);
    setShowComplaint(true);
  };

  const submitComplaint = () => {
    if (!preferred_resolution || !message) {
      alert("Please fill in both fields.");
      return;
    }

    fetch("http://localhost:8000/complaints", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: selectedOrderId,
        description: message,
        preferred_resolution: preferred_resolution,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Failed to submit complaint");
        }
        return res.json();
      })
      .then(() => {
        alert("Complaint submitted successfully.");
        setShowComplaint(false);
        setPreferredResolution("");
        setMessage("");
      })
      .catch((err) => alert(`Error: ${err.message}`));
  };

  const openOrderDetails = (orderId) => {
    const order = orders.find((order) => order.id === orderId);
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (error)
    return <div className="ot-error">Unable to load orders: {error}</div>;

  const filteredOrders = showCancelled
    ? orders
    : orders.filter((o) => o.status !== "cancelled");

  if (!filteredOrders.length)
    return (
      <div className="ot-empty">
        {showCancelled ? "No orders found." : "No active orders."}
      </div>
    );

  const reversedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="ot-track-background">
    <section className="ot-track-container">
      <div className="ot-toggle">
        <label>
          <input
            type="checkbox"
            checked={showCancelled}
            onChange={() => setShowCancelled((prev) => !prev)}
          />{" "}
          Show Cancelled Orders
        </label>
      </div>

      <div className="ot-track-wrapper">
        <button
          className="ot-scroll-btn"
          onClick={() => {
            document
              .querySelector(".ot-track")
              ?.scrollBy({ left: -300, behavior: "smooth" });
          }}
          aria-label="Scroll Left"
        >
          ‹
        </button>

        <div className="ot-track" role="list">
          {reversedOrders.map((order) => (
            <div
              key={order.id}
              className={`ot-order-card`}
              role="listitem"
              tabIndex={0}
              title={`Order #${order.id}`}
              onClick={() => openOrderDetails(order.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openOrderDetails(order.id);
              }}
            >
              <div className="ot-order-card-header">
                <h3 className="ot-order-id">Order #{order.id}</h3>
                <time className="ot-order-date">{formatDateTime(order.date)}</time>
              </div>
              <div>
                Status:{" "}
                <span className={`ot-order-status ot-status-${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div>
                Total: ${order.total_price ? order.total_price.toFixed(2) : "N/A"}
              </div>

              <div className="ot-order-actions">
                {order.status === "pending" && (
                  <button
                    className="ot-btn ot-btn-cancel"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelOrder(order.id);
                    }}
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  className="ot-btn ot-btn-details"
                  onClick={(e) => {
                    e.stopPropagation();
                    openOrderDetails(order.id);
                  }}
                >
                  View Details
                </button>
                <button
                  className="ot-btn ot-btn-complaint"
                  onClick={(e) => {
                    e.stopPropagation();
                    openComplaint(order.id);
                  }}
                >
                  Write Complaint
                </button>

                {showCancelled && order.status === "cancelled" && (
                  <button
                    className="ot-btn ot-btn-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOrder(order.id);
                    }}
                    aria-label={`Remove cancelled order #${order.id}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          className="ot-scroll-btn"
          onClick={() => {
            document
              .querySelector(".ot-track")
              ?.scrollBy({ left: 300, behavior: "smooth" });
          }}
          aria-label="Scroll Right"
        >
          ›
        </button>
      </div>

      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowOrderDetails(false)}
        />
      )}

      {showComplaint && (
        <ComplaintModal
          selectedOrderId={selectedOrderId}
          preferred_resolution={preferred_resolution}
          setPreferredResolution={setPreferredResolution}
          message={message}
          setMessage={setMessage}
          onClose={() => setShowComplaint(false)}
          onSubmit={submitComplaint}
        />
      )}
    </section></div>
  );
}
