import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerComplaints.css";

export default function CustomerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/complaints/assigned", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch complaints");
        return res.json();
      })
      .then((data) => {
        setComplaints(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="custcompl-bg">
      <div className="custcompl-wrapper">
        <h2 className="custcompl-header">My Complaints</h2>

        <p className="custcompl-info">
          Our support team is committed to resolving the issues you've raised through your recent complaints.
          We're here to help ensure a smooth and satisfactory experience with your orders from <strong>FurniStyle</strong>.
          Please select one of the complaints below to continue the conversation and find a final resolution.
        </p>

        {loading ? (
          <p className="custcompl-loading">Loading complaints...</p>
        ) : error ? (
          <p className="custcompl-error">{error}</p>
        ) : complaints.length === 0 ? (
          <p className="custcompl-empty">You have no assigned complaints at the moment.</p>
        ) : (
          <div className="custcompl-list">
            {complaints.map((complaint, index) => (
              <div className="custcompl-item" key={complaint.id}>
                <h4 className="custcompl-item-header">Complaint #{index + 1}</h4>
                <p><strong>Order ID:</strong> {complaint.order_id}</p>
                <p><strong>Status:</strong> {complaint.status}</p>
                <p><strong>Filed On:</strong> {new Date(complaint.created_at).toLocaleString()}</p>
                <p><strong>Preferred resolution you stated:</strong> {complaint.preferred_resolution || "Not specified"}</p>
                <p><strong>Your complaint message was:</strong></p>
                <div className="custcompl-message">{complaint.description}</div>
                <button
                  className="custcompl-chat-button"
                  onClick={() => navigate(`/customer/chat/${complaint.id}`)}
                >
                  Chat with Support
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
