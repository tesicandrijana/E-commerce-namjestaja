import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatBox from "../../components/ChatBox"; // putanja do tvoje ChatBox komponente

export default function CustomerComplaintChat() {
  const { complaintId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/users/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data))
      .catch((err) => console.error("Greška pri dohvaćanju korisnika:", err));
  }, []);

  if (!currentUser) return <p>Učitavanje korisnika...</p>;

  return (
    <div className="chat-page-wrapper">
      <ChatBox complaintId={complaintId} currentUser={currentUser} />
    </div>
  );
}
