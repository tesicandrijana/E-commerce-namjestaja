import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ComplaintDetails.css";
import ChatBox from "../../components/ChatBox";

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [finalResolution, setFinalResolution] = useState("");
  const [responseText, setResponseText] = useState("");
  const [status, setStatus] =useState("");
  const [showChat, setShowChat] =useState(false);    // za chat
  const [currentUser, setCurrentUser]= useState(null);

  useEffect(() => {
     axios
      .get(`http://localhost:8000/support/complaints/${id}`, {
        withCredentials: true, //  za cookie autentifikaciju
      })
      .then((res) => {
        setComplaint(res.data);
        setFinalResolution(res.data.final_resolution || "");
        setResponseText(res.data.response_text || "");
        setStatus(res.data.status || "");
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleUpdate = () => {
    axios
      .put(`http://localhost:8000/support/complaints/${id}`, {
        final_resolution: finalResolution,
      }, { withCredentials: true })
      .then((res) => {
        console.log("Updates:", res.data);
        alert("Resolution updated successfully!");
        })
      .catch((err) => console.error(err));
  };

  const handleRespond = () => {
    axios
      .put(`http://localhost:8000/support/complaints/${id}/respond`, {
        response_text: responseText,
      }, { withCredentials: true })
      .then((res) => {
        console.log("Response sent:", res.data);
        alert("Response sent successfully!");
       })
      .catch((err) => console.error(err));
  };

  const handleStatusUpdate = () => {
    axios
      .put(
        `http://localhost:8000/support/complaints/${id}`,
        { status },
        { withCredentials: true }
      )
      .then(() => alert("Status updated successfully!"))
      .catch((err) => console.error("Status update failed:", err));
  };

  useEffect(() => {
    axios
      .get("http://localhost:8000/users/me", { withCredentials: true })
      .then((res) => setCurrentUser(res.data))
      .catch((err) => console.error("Greška pri dohvaćanju korisnika:", err));
  }, []);
    if (!complaint) return <p className="loading">Loading complaint...</p>;

  return (
    <div className="complaint-flex-okvir">
      <div className="sveOsimChata">
        <button className="back-link" onClick={() => navigate(-1)}>←</button>
        <h1 className="title">Complaint #{complaint.id}</h1>
        <div className="complaint-section">
          <h3>Complaint Info</h3>
          <div className="complaint-info-grid">
            <p>
              <strong>Order ID:</strong> {complaint.order_id}
              <button
                className="order-btn"
                onClick={() => navigate(`/support/orders/${complaint.order_id}`)}
              >
                View Order
              </button>
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-badge ${complaint.status}`}>{complaint.status}</span>
            </p>
            <p>
              <strong>Created At:</strong> {new Date(complaint.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Preferred Resolution:</strong> {complaint.preferred_resolution || "Not provided"}
            </p>
            <p>
              <strong>Description:</strong> {complaint.description}
            </p>
          </div>
        </div>

      

        <div className="complaint-section">
          <h3>Action Panel</h3>

          <div className="update-status">

            <div className="form-card">
              <label>Update Complaint Status:</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="declined">Declined</option>
              </select>
              <button className="status-btn" onClick={handleStatusUpdate}>
                Update Status
              </button>
            </div>

            <div className="form-card">
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
              <button className="update-btn" onClick={handleUpdate}>
                Update Resolution
              </button>
            </div>
          </div>
       
        </div>
      </div>

      {/* Da zaposlenici kojim nije assigned complaint ne vide prazan prostor */}
      {currentUser?.id===complaint.assigned_to && (
      <div className="chat-panel">
        {!showChat && (
            <div className="form-card">
              <label>Chat With Customer:</label>
              <button className="chat-btn" onClick={() => setShowChat(true)}>
                Start Chat
              </button>
            </div>
          )}

          {showChat && (
            
              <ChatBox complaintId={id} currentUser={currentUser}/>
            
          )}
      </div>
      )}
      
{/* 
        <div className="form-card">
          <label>Respond to Customer:</label>
          <textarea
            rows={5}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
          />
          <button className="respond-btn" onClick={handleRespond}>
            Send Response
          </button>
        </div> */}  

    </div>
    
  );
}