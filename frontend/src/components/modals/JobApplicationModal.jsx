import React, { useState } from "react";
import "./JobApplicationModal.css";

function JobApplicationModal({ selectedApp, loadingDetails, error, closeModal }) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [message, setMessage] = useState("");

  const handleSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      setMessage("Please select date and time.");
      return;
    }
    // Ovde ide logika za slanje termina na backend
    setMessage(`Interview scheduled on ${scheduledDate} at ${scheduledTime}`);
  };

  if (!selectedApp) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={closeModal}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="modal-left">
          {loadingDetails ? (
            <p>Loading details...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <>
              <h2>{selectedApp.name}</h2>
              <p>
                <strong>Email:</strong> {selectedApp.email}
              </p>
              <p>
                <strong>Role:</strong> {selectedApp.role}
              </p>

              <div className="modal-actions">
                <a
                  href={selectedApp.cvUrl}
                  className="download-cv-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Download CV
                </a>
              </div>
            </>
          )}
        </div>

        <div className="modal-right">
          <h3>Schedule Interview</h3>
          <label>
            Date:
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </label>

          <label>
            Time:
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </label>

          <div className="schedule-container">
            <button onClick={handleSchedule} className="schedule-btn">
              Schedule
            </button>
            {message && <div className="schedule-message">{message}</div>}
          </div>
        </div>

        {/* Dugme za odbijanje zahteva */}
        <div className="reject-container">
          <button
            className="reject-btn"
            onClick={() => {
              alert("Request rejected");
            }}
          >
            Reject the Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobApplicationModal;
