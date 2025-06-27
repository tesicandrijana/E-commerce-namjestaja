import { useEffect, useRef, useState } from "react";
import "./ChatBox.css"; // povezujemo stilove

export default function ChatBox({ complaintId, currentUser }) {
  const [messages, setMessages] = useState([]); // sve poruke
  const [message, setMessage] = useState("");   // trenutna poruka
  const socketRef = useRef(null);               // referenca za websocket
  const bottomRef = useRef(null);               // za automatski scroll

  // Prikupi sve prethodne poruke kada se ucita komponenta
  useEffect(() => {
    fetch(`http://localhost:8000/complaints/${complaintId}/messages`, {
      credentials: "include", // da se salju cookies
    })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Greška pri dohvatu poruka:", err));
  }, [complaintId]);

  //otvaranje websocket konekcije
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${complaintId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Povezan na WebSocket");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    socket.onerror = (err) => {
      console.error("Greška na WebSocket konekciji:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket zatvoren");
    };

    return () => {
      socket.close();
    };
  }, [complaintId]);

  //scroll na kraj poruka nakon svake promjene
  useEffect(() => {
    const chatBox = bottomRef.current?.parentNode;
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [messages]);



  // Funkcija za slanje poruke
  const sendMessage = () => {
    if (!message.trim()) return;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          message: message.trim(),
        })
      );
      setMessage("");
    }
  };

  return (
    <div className="chat-box-container">
      <h2 className="chat-title">Live Chat</h2>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-row ${
              msg.sender_id === currentUser.id ? "message-right" : "message-left"
            }`}
          >
            <div className="message-bubble">
              <strong>{msg.from}:</strong> {msg.message}
              <div className="message-meta">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Send a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="chat-send-btn" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
