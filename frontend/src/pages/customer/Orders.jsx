import React, { useEffect, useState } from "react";
import ComplaintModal from "./ComplaintModal";
import OrderDetailsModal from "./OrderDetailsModal";
import ProductModal from "./ProductModal";
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
<<<<<<< HEAD

=======
>>>>>>> 5bc068cdd08fa457f6e4606093e67a1cb240286b
  const [productsMap, setProductsMap] = useState({});
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4;
  const [modalProduct, setModalProduct] = useState(null);

<<<<<<< HEAD
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const showModal = (type, title, message) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };
=======
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
>>>>>>> 5bc068cdd08fa457f6e4606093e67a1cb240286b

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

  useEffect(() => {
    if (orders.length === 0) return;
    const productIds = [
      ...new Set(
        orders.flatMap((order) => order.items?.map((item) => item.product_id) || [])
      ),
    ];
    async function fetchProducts() {
      try {
        const products = await Promise.all(
          productIds.map((id) =>
            fetch(`http://localhost:8000/products/${id}`).then((res) => res.json())
          )
        );
        const map = {};
        products.forEach((p) => {
          const formattedImages = p.images
            ? p.images.map((img) => `${IMAGE_BASE_URL}${img.image_url}`)
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
    if (!product) return "https://dummyimage.com/100x100/cccccc/000000&text=No+Image";
    if (product.images?.[0]) return product.images[0];
    if (product.image) return IMAGE_BASE_URL + product.image;
    return "https://dummyimage.com/100x100/cccccc/000000&text=No+Image";
  };

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

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
      .then(() =>
        setOrders((prev) =>
<<<<<<< HEAD
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" } : o
          )
        );
      })
      .catch((err) => showModal("error", "Error", err.message));
=======
          prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
        )
      )
      .catch((err) =>
        setModalState({
          isOpen: true,
          type: "error",
          title: "Cancellation Failed",
          message: err.message,
        })
      );
>>>>>>> 5bc068cdd08fa457f6e4606093e67a1cb240286b
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
<<<<<<< HEAD
      showModal("error", "Missing Fields", "Please fill in both fields.");
=======
      setModalState({
        isOpen: true,
        type: "error",
        title: "Missing Fields",
        message: "Please fill in both resolution and message.",
      });
>>>>>>> 5bc068cdd08fa457f6e4606093e67a1cb240286b
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
<<<<<<< HEAD
        showModal("success", "Complaint Sent", "Complaint submitted successfully.");
=======
        setModalState({
          isOpen: true,
          type: "success",
          title: "Complaint Submitted",
          message: "Your complaint has been submitted successfully.",
        });
>>>>>>> 5bc068cdd08fa457f6e4606093e67a1cb240286b
        setShowComplaint(false);
        setPreferredResolution("");
        setMessage("");
      })
<<<<<<< HEAD
      .catch((err) => showModal("error", "Error", err.message));
=======
      .catch((err) =>
        setModalState({
          isOpen: true,
          type: "error",
          title: "Submission Failed",
          message: err.message,
        })
      );
>>>>>>> 5bc068cdd08fa457f6e4606093e67a1cb240286b
  };

  const openOrderDetails = (orderId) => {
    const order = orders.find((order) => order.id === orderId);
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

<<<<<<< HEAD
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

=======
>>>>>>> 5bc068cdd08fa457f6e4606093e67a1cb240286b
  const filteredOrders = showCancelled
    ? orders
    : orders.filter((o) => o.status !== "cancelled");
  const reversedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
<<<<<<< HEAD

=======
>>>>>>> 5bc068cdd08fa457f6e4606093e67a1cb240286b
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = reversedOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
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
            />
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
              <div key={order.id} className="ot-order-card">
                <div className="ot-order-card-header">
                  <h3>Order #{order.id}</h3>
                  <time>{formatDateTime(order.date)}</time>
                </div>
                <div>Status: <span className={`ot-order-status ot-status-${order.status}`}>{order.status}</span></div>
                <div>Total: {order.total_price?.toFixed(2) || "N/A"} KM</div>

                <div className={`ot-order-products ${isExpanded ? "expanded" : "collapsed"}`}>
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
                    <button onClick={() => cancelOrder(order.id)} className="ot-btn ot-btn-cancel">
                      Cancel Order
                    </button>
                  )}
                  <button onClick={() => openOrderDetails(order.id)} className="ot-btn ot-btn-details">
                    View Details
                  </button>
                  <button onClick={() => openComplaint(order.id)} className="ot-btn ot-btn-complaint">
                    Write Complaint
                  </button>
                  {showCancelled && order.status === "cancelled" && (
                    <button onClick={() => removeOrder(order.id)} className="ot-btn ot-btn-remove">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="ot-pagination">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
            Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>

        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={() => setShowOrderDetails(false)} />
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
<<<<<<< HEAD
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
=======
          isOpen={modalState.isOpen}
          onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
>>>>>>> 5bc068cdd08fa457f6e4606093e67a1cb240286b
        />
      </section>
    </div>
  );
}

