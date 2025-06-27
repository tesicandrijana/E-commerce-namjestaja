import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Inquiries.css";

function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState("unresponded"); // 'unresponded' ili 'responded'
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
        console.error("Greska pri dohvatu upita", error);
      });
  }, []);

  let filteredInquiries = [];

    if (activeTab === "unresponded") {
      // prikaz samo neodgovorenih upita ili ako je odgovor prazan string
    filteredInquiries = inquiries.filter((inquiry) => {
        return !inquiry.response || inquiry.response.trim() === "";
    });
    } else if (activeTab === "responded") {
       // prikaz samo oodgovorenih upita
    filteredInquiries = inquiries.filter((inquiry) => {
        return inquiry.response && inquiry.response.trim() !== "";
    });
    }


  return (
    <div className="inquiries-wrapper">
      <button className="back-link" onClick={() => navigate("/support")}>
        ←
      </button>
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
        {/* Ako nema nijednog upita*/}
        {filteredInquiries.length === 0 ? (
            <p>No inquiries in this tab.</p>
        ) : (
            // prikazi pomocu .map
            filteredInquiries.map((inquiry) => {
            return (
                <div className="inquiry-card-support" key={inquiry.id}>
                
                <div className="inquiry-header-support">
                    <strong>#{inquiry.id}</strong>
                    <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                </div>

                <div className="inquiry-body-support">
                    <p><strong>Name:</strong> {inquiry.name}</p>
                    <p><strong>Email:</strong> {inquiry.email}</p>
                    <p><strong>Message:</strong> {inquiry.message}</p>

                    {/*prikazi odgovor ako postoji */}
                    {inquiry.response && inquiry.response.trim() !== "" && (
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
            );
            })
        )}
        </div>
    </div>
  );
}

export default Inquiries;
