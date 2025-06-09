import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatBox from "../../components/ChatBox";
import "./CustomerComplaintChat.css";

export default function CustomerComplaintChat() {
  const { complaintId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/users/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="spinner" />
        <p>Loading chat interface...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <p className="error-message">Unable to load user data.</p>;
  }

  return (
    <div className="chat-page-wrapper">
      <div className="chat-header">
        <h2>Customer-Support Chat</h2>
        <p className="subtext">You're now connected with our support team.</p>
      </div>
      <ChatBox complaintId={complaintId} currentUser={currentUser} />
    </div>
  );
}
