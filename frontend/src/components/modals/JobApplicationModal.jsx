import React, { useState } from "react";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import UniversalModal from "./UniversalModal";
import "./JobApplicationModal.css";

function JobApplicationModal({
  selectedApp,
  loadingDetails,
  error,
  closeModal,
}) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      setMessage("Please select date and time.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8000/job-application/${selectedApp.id}/schedule`,
        {
          date: scheduledDate,
          time: scheduledTime,
        }
      );

      setMessage("Interview successfully scheduled and email sent.");
      setConfirmOpen(true);
    } catch (error) {
      console.error("Error scheduling interview:", error);
      setMessage("Error scheduling interview.");
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(
        `http://localhost:8000/job-application/${selectedApp.id}/reject`,
        {
          message:
            "Your application has been rejected. Thank you for your interest.",
        }
      );
      setRejectMessage("Application rejected and email sent.");
      setConfirmRejectOpen(false);
      closeModal();
    } catch (error) {
      console.error("Error rejecting application:", error);
      setRejectMessage("Error rejecting application.");
      setConfirmRejectOpen(false);
    }
  };

  const handleDownloadCv = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/job-application/${selectedApp.id}/download-cv`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", selectedApp.cv_file || "cv.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading CV:", error);
      alert("Failed to download CV.");
    }
  };

  if (!selectedApp) return null;

  return (
    <>
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
                  <button
                    onClick={handleDownloadCv}
                    className="download-cv-btn"
                  >
                    Download CV
                  </button>
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

          <div className="reject-container">
            <button
              className="reject-btn"
              onClick={() => setConfirmRejectOpen(true)}
            >
              Reject the Request
            </button>
            {rejectMessage && <p>{rejectMessage}</p>}
          </div>
        </div>
      </div>

      <UniversalModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          closeModal();
        }}
        type="success"
        title="Interview Scheduled"
        message="Interview has been successfully scheduled and an email has been sent."
      />

      <ConfirmModal
        isOpen={confirmRejectOpen}
        title="Reject Application"
        message="Are you sure you want to reject this application?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleReject}
        onCancel={() => setConfirmRejectOpen(false)}
      />
    </>
  );
}

export default JobApplicationModal;
