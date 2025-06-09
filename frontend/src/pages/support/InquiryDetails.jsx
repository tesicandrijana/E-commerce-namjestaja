import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./InquiryDetails.css";

function InquiryDetails() {
  const { id } = useParams(); 
  const [inquiry, setInquiry] = useState(null); 
  const [responseText, setResponseText] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/support/inquiries", {
        withCredentials: true,
      })
      .then((res) => {
        const found = res.data.find((inq) => inq.id === parseInt(id));
        setInquiry(found);
      })
      .catch((err) => {
        console.error("Greška pri učitavanju upita", err);
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        `http://localhost:8000/support/inquiries/${id}/respond`,
        { response: responseText },
        { withCredentials: true }
      )
      .then(() => {
        alert("Response sent to Mail!");
        navigate("/support/inquiries");
      })
      .catch((err) => {
        console.error("Error", err);
      });
  };

  if (!inquiry) return <p>Učitavanje...</p>;

  return (
    <div className="inquiry-details-wrapper">
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
      <h2>Inquiry Details #{inquiry.id}</h2>
      <p><strong>Name:</strong> {inquiry.name}</p>
      <p><strong>Email:</strong> {inquiry.email}</p>
      <p><strong>Message:</strong> {inquiry.message}</p>
      <p><strong>Created at:</strong> {new Date(inquiry.created_at).toLocaleString()}</p>

      {inquiry.response ? (
        <div className="response-box">
          <p><strong>Response:</strong> {inquiry.response}</p>
          <p><strong>Responded at:</strong> {new Date(inquiry.responded_at).toLocaleString()}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="response-form">
          <label htmlFor="response">Your response:</label>
          <textarea
            id="response"
            rows="5"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            required
          ></textarea>
          <button type="submit" className="send-btn">Send to e-mail</button>
        </form>
      )}
    </div>
  );
}

export default InquiryDetails;
