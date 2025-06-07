import React, { useState, useEffect } from "react";
import "./ComplaintModal.css";

const ComplaintModal = ({
  selectedOrderId,
  subject,
  setSubject,
  message,
  setMessage,
  onClose,
  onSubmit,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
  };

  
  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("orders-v1-complaint-overlay")) {
      handleClose();
    }
  };

  return (
    <div
      className={`orders-v1-complaint-overlay ${isClosing ? "fade-out" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div
        className={`orders-v1-complaint-panel ${isClosing ? "slide-out" : "animate"}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <header className="orders-v1-complaint-header">
          <h2 className="orders-v1-complaint-title">Submit a Complaint</h2>
          <button
            className="orders-v1-complaint-close-button"
            onClick={handleClose}
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        <p className="orders-v1-complaint-order-info">
          Regarding Order: <strong>{selectedOrderId}</strong>
        </p>

        <form
          className="orders-v1-complaint-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <label htmlFor="complaint-subject" className="orders-v1-complaint-label">
            Subject
          </label>
          <input
            id="complaint-subject"
            className="orders-v1-complaint-input"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject"
            required
          />

          <label htmlFor="complaint-message" className="orders-v1-complaint-label">
            Message
          </label>
          <textarea
            id="complaint-message"
            className="orders-v1-complaint-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue..."
            required
          />

          <div className="orders-v1-complaint-actions">
            <button
              type="submit"
              className="orders-v1-complaint-btn orders-v1-complaint-submit-btn"
            >
              Submit
            </button>
            <button
              type="button"
              className="orders-v1-complaint-btn orders-v1-complaint-cancel-btn"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintModal;
