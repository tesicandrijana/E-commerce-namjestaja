// Inquiries.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Inquiries.css";

function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState("unresponded"); // 'unresponded' or 'responded'
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/support/inquiries", {
        withCredentials: true,
      })
      .then((response) => {
        setInquiries(response.data);
      })
      .catch((error) => {
        console.error("Greška pri dohvatu upita", error);
      });
  }, []);

  const filteredInquiries = inquiries.filter((inquiry) =>
    activeTab === "unresponded" ? !inquiry.response : inquiry.response
  );

  return (
    <div className="inquiries-wrapper">
      <h1 className="inquiries-title">Customer Inquiries</h1>

      <div className="tabs">
        <div
          className={`tab ${activeTab === "unresponded" ? "active" : ""}`}
          onClick={() => setActiveTab("unresponded")}
        >
          Unresponded
        </div>
        <div
          className={`tab ${activeTab === "responded" ? "active" : ""}`}
          onClick={() => setActiveTab("responded")}
        >
          Responded
        </div>
      </div>

      <div className="inquiries-list">
        {filteredInquiries.length === 0 ? (
          <p>No inquiries in this tab.</p>
        ) : (
          filteredInquiries.map((inquiry) => (
            <div className="inquiry-card" key={inquiry.id}>
              <div className="inquiry-header">
                <strong>#{inquiry.id}</strong>
                <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
              </div>

              <div className="inquiry-body">
                <p><strong>Name:</strong> {inquiry.name}</p>
                <p><strong>Email:</strong> {inquiry.email}</p>
                <p><strong>Message:</strong> {inquiry.message}</p>
                {inquiry.response && (
                  <p><strong>Response:</strong> {inquiry.response}</p>
                )}
              </div>

              {activeTab === "unresponded" && (
                <div className="inquiry-actions">
                  <button
                    className="reply-button"
                    onClick={() => navigate(`/support/inquiries/${inquiry.id}`)}
                  >
                    Respond
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Inquiries;
