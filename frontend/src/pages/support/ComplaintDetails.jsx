import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ComplaintDetails.css";

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [finalResolution, setFinalResolution] = useState("");
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
     axios
      .get(`http://localhost:8000/support/complaints/${id}`, {
        withCredentials: true, //  za cookie autentifikaciju
      })
      .then((res) => {
        setComplaint(res.data);
        setFinalResolution(res.data.final_resolution || "");
        setResponseText(res.data.response_text || "");
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleUpdate = () => {
    axios
      .patch(`http://localhost:8000/support/complaints/${id}`, {
        final_resolution: finalResolution,
      }, { withCredentials: true })
      .then(() => alert("Resolution updated successfully!"))
      .catch((err) => console.error(err));
  };

  const handleRespond = () => {
    axios
      .post(`http://localhost:8000/support/complaints/${id}/respond`, {
        response_text: responseText,
      }, { withCredentials: true })
      .then(() => alert("Response sent successfully!"))
      .catch((err) => console.error(err));
  };

  if (!complaint) return <p className="loading">Loading complaint...</p>;

  return (
    <div className="complaint-details-container">
      <button className="back-link" onClick={() => navigate(-1)}>← Back to List</button>
      <h1 className="title">Complaint Details</h1>
      <p>
        <strong>Status:</strong>{" "}
        <span className={`status-badge ${complaint.status}`}>{complaint.status}</span>
      </p>


      <div className="complaint-info">
        <p><strong>ID:</strong> {complaint.id}</p>
        <p><strong>Order ID:</strong> {complaint.order_id}</p>
        <p><strong>Customer:</strong> {complaint.customer_name}</p>
        <p><strong>Created At:</strong> {new Date(complaint.created_at).toLocaleString()}</p>
        <p><strong>Status:</strong> {complaint.status}</p>
        <p><strong>Preferred Resolution:</strong> {complaint.preferred_resolution || "Not provided"}</p>
        <p><strong>Description:</strong> {complaint.description}</p>
        {complaint.response_text && (
          <div className="response-box">
            <strong>Previous Response:</strong><br />
            {complaint.response_text}
          </div>
        )}
        <p>
          <strong>Final Resolution:</strong>{" "}
          {complaint.final_resolution ? (
            <span className={`tag final ${complaint.final_resolution}`}>{complaint.final_resolution}</span>
          ) : (
            "Not decided"
          )}
        </p>
      </div>

      <div className="form-section">
        <label>Final Resolution:</label>
        <select
          value={finalResolution}
          onChange={(e) => setFinalResolution(e.target.value)}
        >
          <option value="">-- Select --</option>
          <option value="refund">Refund</option>
          <option value="return">Return</option>
          <option value="repair">Repair</option>
          <option value="decline">Decline</option>
        </select>

        <label>Respond to Customer:</label>
        <textarea
          rows={5}
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
        />

        <div className="button-group">
          <button className="update-btn" onClick={handleUpdate}>Update Resolution</button>
          <button className="respond-btn" onClick={handleRespond}>Send Response</button>
        </div>
      </div>

      
    </div>
  );
}
