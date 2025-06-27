import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Notification.css";

export default function Notification({ currentUser }) {
  const [notifications, setNotifications] = useState([]); // cuva sve notifikacije
  const [dropdownVidljivost, setDropdownVidljivost] = useState(false);  //lista kad kliknemo na zvono
  const navigate = useNavigate();

  useEffect(() => {

    if(!currentUser) return;  //ako currentUser nije ucitan jos

    //novo:prvo povuci sve neprocitane notifikacije iz baze
    axios.get("http://localhost:8000/notifications/unread", { withCredentials: true })
      .then(res => {
        setNotifications(res.data); //api vraca listu grouped notif
      });

    // otvori WebSocket
    const socket = new WebSocket("ws://localhost:8000/ws/notifications");

    socket.onopen = () => {
      console.log("Povezan na notifikacije za usera:", currentUser.name);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      //ako stigne nova notifikacija, update state
      if (data.receiver_id === currentUser.id) {
        setNotifications((prev) => {
          //ne dozvoli duplikate, tj nema vise notifikacija za isti complaint
          //prikazi najnoviju notifikaciju 
          const filtered = prev.filter((n) => n.complaint_id !== data.complaint_id);
          return [...filtered, data];
        });
      }
    };

    // zatvori konekciju
    return () => socket.close();
  }, [currentUser?.id]);   // OVO JE TREBALO DODATI! nullable??

  //kada se klikne na notifikaciju
  const handleClick = (complaintId) => {
    if (!currentUser) return;  //dodano, nije radilo bez

    //oznaci na backendu kao procitanu
    axios.post(`http://localhost:8000/notifications/${complaintId}/mark-read`, {}, { withCredentials: true })
      .then(() => {
        //samo ako je uspjelo, ukloni iz local state-a
        setNotifications((prev) => prev.filter((n) => n.complaint_id!==complaintId));
      })
      .catch((err) => {
        console.error("Failed to mark notification as read", err);
      });

    //navigate i zatvori dropdown odmah
    setDropdownVidljivost(false);
    if (currentUser.role === "support") {
      navigate(`/support/complaints/${complaintId}`);
    } else if (currentUser.role === "customer") {
      navigate(`/customer/chat/${complaintId}`);
    }
  };

  useEffect(() =>{
    const handleClickOutside = (e) =>{
        //ako kliknemo izvan zvona
        if(!e.target.closest(".notification-bell")){
            setDropdownVidljivost(false);
        }
    };

    document.addEventListener("click", handleClickOutside);
    return() => document.removeEventListener("click", handleClickOutside);

  }, []);

  return (
    <div className="notification-bell">
      <button className="bell-icon" onClick={() => setDropdownVidljivost(!dropdownVidljivost)}>
        <i className="fa fa-bell"></i> {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
      </button>

      {/*dropdown lista notifikacija - vidimo samo kad kliknemo*/}
      {dropdownVidljivost&& notifications.length > 0 && (
        <div className="notif-dropdown">
          {notifications.map((notif, index) => (
            <div
              key={index}
              className="notif-item"
              onClick={() => handleClick(notif.complaint_id)}
            >
              New message from <strong>{notif.from}</strong> — complaint #{notif.complaint_id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
