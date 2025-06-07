import React, { useEffect, useState } from "react";
import ComplaintModal from "./ComplaintModal"; 
import OrderDetailsModal from "./OrderDetailsModal"; 
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [showComplaint, setShowComplaint] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
          prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
        );
      })
      .catch((err) => alert(`Error: ${err.message}`));
  };

  const openComplaint = (orderId) => {
    setSelectedOrderId(orderId);
    setShowComplaint(true);
  };

  const submitComplaint = () => {
    if (!subject || !message) {
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
        preferred_resolution: subject,
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
        setSubject("");
        setMessage("");
      })
      .catch((err) => alert(`Error: ${err.message}`));
  };

  const openOrderDetails = (orderId) => {
    const order = orders.find((order) => order.id === orderId);
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (error) return <div className="orders-v1-error">Unable to load orders: {error}</div>;
  if (!orders.length) return <div className="orders-v1-empty">No orders found.</div>;

  const reversedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <section className="orders-main">
      <div className="orders-v1-wrapper">
        <div className="orders-v1-stack">
          {reversedOrders.map((order, index) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div
                key={order.id}
                className={`order-square ${isExpanded ? "expanded" : ""}`}
                style={{
                  zIndex: orders.length - index,
                  left: index * 10,
                  top: index * 20,
                  cursor: "pointer",
                }}
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                title={`Order #${order.id}`}
                aria-expanded={isExpanded}
                aria-controls={`order-details-${order.id}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setExpandedOrderId(isExpanded ? null : order.id);
                  }
                }}
              >
                {!isExpanded && <span className="order-number">#{index + 1}</span>}

                {isExpanded && (
                  <div id={`order-details-${order.id}`} className="order-details">
                    <div className="order-header">
                      <span>Order ID: {order.id}</span>
                      <span>{formatDateTime(order.date)}</span>
                    </div>
                    <div>
                      Status:{" "}
                      <span className={`status status-${order.status}`}>{order.status}</span>
                    </div>
                    <div>
                      Total: ${order.total_price ? order.total_price.toFixed(2) : "N/A"}
                    </div>

                    <div className="order-actions">
                      {order.status === "pending" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelOrder(order.id);
                          }}
                        >
                          Cancel Order
                        </button>
                      )}
                      <button
                        className="view-details-btn"
                        onClick={() => openOrderDetails(order.id)}
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openComplaint(order.id);
                        }}
                      >
                        Write Complaint
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setShowOrderDetails(false)} />
      )}

      {showComplaint && (
        <ComplaintModal
          selectedOrderId={selectedOrderId}
          subject={subject}
          setSubject={setSubject}
          message={message}
          setMessage={setMessage}
          onClose={() => setShowComplaint(false)}
          onSubmit={submitComplaint}
        />
      )}
    </section>
  );
}
