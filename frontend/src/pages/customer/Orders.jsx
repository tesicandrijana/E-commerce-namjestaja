import React, { useEffect, useState } from "react";
import ComplaintModal from "./ComplaintModal";
import OrderDetailsModal from "./OrderDetailsModal";
import ProductModal from "./ProductModal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import UniversalModal from "../../components/modals/UniversalModal";
import "./OrdersTrack.css";

const IMAGE_BASE_URL = "http://localhost:8000/static/product_images/";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [showComplaint, setShowComplaint] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [preferredResolution, setPreferredResolution] = useState("");
  const [message, setMessage] = useState("");
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);

  const [productsMap, setProductsMap] = useState({});
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4;
  const [modalProduct, setModalProduct] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const showModal = (type, title, message) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

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
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    const productIds = [
      ...new Set(
        orders.flatMap((order) =>
          order.items?.map((item) => item.product_id) || []
        )
      ),
    ];

    async function fetchProducts() {
      try {
        const promises = productIds.map((id) =>
          fetch(`http://localhost:8000/products/${id}`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch product " + id);
            return res.json();
          })
        );

        const products = await Promise.all(promises);

        const map = {};
        products.forEach((p) => {
          const formattedImages = p.images
            ? p.images.map(
                (img) =>
                  `http://localhost:8000/static/product_images/${img.image_url}`
              )
            : [];
          map[p.id] = { ...p, images: formattedImages };
        });
        setProductsMap(map);
      } catch (err) {
        console.error(err);
      }
    }

    fetchProducts();
  }, [orders]);

  const getImageUrl = (product) => {
    if (!product)
      return "https://dummyimage.com/100x100/cccccc/000000&text=No+Image";
    if (product.images && product.images.length > 0 && product.images[0])
      return product.images[0];
    if (product.image) return IMAGE_BASE_URL + product.image;
    return "https://dummyimage.com/100x100/cccccc/000000&text=No+Image";
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const confirmCancelOrder = (orderId) => {
    setOrderToCancel(orderId);
    setConfirmOpen(true);
  };

  const cancelOrder = () => {
    fetch(`http://localhost:8000/orders/cancel/${orderToCancel}`, {
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
            o.id === orderToCancel ? { ...o, status: "cancelled" } : o
          )
        );
        setConfirmOpen(false);
      })
      .catch((err) => {
        showModal("error", "Error", err.message);
        setConfirmOpen(false);
      });
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
    if (!preferredResolution || !message) {
      showModal("error", "Missing Fields", "Please fill in both fields.");
      return;
    }

    fetch("http://localhost:8000/complaints", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: selectedOrderId,
        description: message,
        preferred_resolution: preferredResolution,
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
        showModal("success", "Complaint Sent", "Complaint submitted successfully.");
        setShowComplaint(false);
        setPreferredResolution("");
        setMessage("");
      })
      .catch((err) => showModal("error", "Error", err.message));
  };

  const openOrderDetails = (orderId) => {
    const order = orders.find((order) => order.id === orderId);
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (error || (orders.length === 0 && !error)) {
    return (
      <div className="ot-track-background">
        <section className="ot-track-container ot-empty-container">
          {error ? (
            <div className="ot-error">Unable to load orders: {error}</div>
          ) : showCancelled ? (
            <div className="ot-empty">No orders found.</div>
          ) : (
            <div className="ot-empty">No active orders.</div>
          )}
        </section>
      </div>
    );
  }

  const filteredOrders = showCancelled
    ? orders
    : orders.filter((o) => o.status !== "cancelled");

  const reversedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = reversedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(reversedOrders.length / ordersPerPage);

  return (
    <div className="ot-track-background">
      <section className="ot-track-container">
        <div className="ot-toggle">
          <label>
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={() => {
                setShowCancelled((prev) => !prev);
                setCurrentPage(1);
              }}
            />{" "}
            Show Cancelled Orders
          </label>
        </div>

        <div className="ot-track-grid">
          {currentOrders.map((order) => {
            const uniqueProducts = [];
            const seenIds = new Set();

            if (order.items) {
              for (const item of order.items) {
                if (!seenIds.has(item.product_id)) {
                  seenIds.add(item.product_id);
                  uniqueProducts.push(productsMap[item.product_id]);
                }
              }
            }

            const isExpanded = expandedOrders.has(order.id);
            const showThreeDots = uniqueProducts.length > 3;

            const productsToShow = isExpanded
              ? uniqueProducts
              : showThreeDots
              ? uniqueProducts.slice(0, 3)
              : uniqueProducts;

            return (
              <div
                key={order.id}
                className="ot-order-card"
                title={`Order #${order.id}`}
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
                  Total:{" "}
                  {order.total_price ? order.total_price.toFixed(2) : "N/A"} KM
                </div>

                <div
                  className={`ot-order-products ${
                    isExpanded ? "expanded" : "collapsed"
                  }`}
                >
                  {productsToShow.map((product, i) => (
                    <img
                      key={i}
                      src={getImageUrl(product)}
                      alt={product?.name || "Product"}
                      className="ot-product-thumb-circle clickable"
                      onClick={() => setModalProduct(product)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://dummyimage.com/100x100/cccccc/000000&text=No+Image";
                      }}
                    />
                  ))}
                  {showThreeDots && (
                    <div
                      className="ot-three-dots clickable"
                      onClick={() => toggleExpand(order.id)}
                      title={isExpanded ? "Show less" : "Show all products"}
                    >
                      {isExpanded ? "−" : "..."}
                    </div>
                  )}
                </div>

                <div className="ot-order-actions">
                  {order.status === "pending" && (
                    <button
                      className="ot-btn ot-btn-cancel"
                      onClick={() => confirmCancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    className="ot-btn ot-btn-details"
                    onClick={() => openOrderDetails(order.id)}
                  >
                    View Details
                  </button>
                  <button
                    className="ot-btn ot-btn-complaint"
                    onClick={() => openComplaint(order.id)}
                  >
                    Write Complaint
                  </button>
                  {showCancelled && order.status === "cancelled" && (
                    <button
                      className="ot-btn ot-btn-remove"
                      onClick={() => removeOrder(order.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="ot-pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
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
            preferred_resolution={preferredResolution}
            setPreferredResolution={setPreferredResolution}
            message={message}
            setMessage={setMessage}
            onClose={() => setShowComplaint(false)}
            onSubmit={submitComplaint}
          />
        )}

        {modalProduct && (
          <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
        )}

        <UniversalModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
        />

        <ConfirmModal
          isOpen={confirmOpen}
          title="Cancel Order"
          message="Are you sure you want to cancel this order?"
          onConfirm={cancelOrder}
          onCancel={() => setConfirmOpen(false)}
        />
      </section>
    </div>
  );
}
