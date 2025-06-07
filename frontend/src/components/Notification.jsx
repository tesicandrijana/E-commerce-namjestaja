import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Notification.css";

export default function Notification({ currentUser }) {
  const [notifications, setNotifications] = useState([]); // cuva sve notifikacije
  const [dropdownVidljivost, setDropdownVidljivost] = useState(false);  //lista kad kliknemo na zvono
  const navigate = useNavigate();

  useEffect(() => {

    if(!currentUser) return;  //ako currentUser nije ucitan jos
    // otvori WebSocket
    const socket = new WebSocket("ws://localhost:8000/ws/notifications");

    socket.onopen = () => {
      console.log("Povezan na notifikacije za usera:", currentUser.name);
    };


    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

    
      if (data.receiver_id === currentUser.id) {
        setNotifications((prev) => [...prev, data]); // dodaj u listu notifikcija ako je poruka za trenutnog usera
      }
    };

    // zatvori konekciju
    return () => socket.close();
  }, [currentUser?.id]);   // OVO JE TREBALO DODATI! nullable??

  //kada se klikne na notifikaciju
  const handleClick = (complaintId) => {
    if (!currentUser) return;  //dodano, nije radilo bez
    if (currentUser.role === "support") {
      navigate(`/support/complaints/${complaintId}`);
    } else if (currentUser.role === "customer") {
      navigate(`/customer/chat/${complaintId}`);
    }

    setDropdownVidljivost(false);

    setNotifications((prev) =>   //brisanje notif iz listze
        prev.filter((n) => n.complaint_id!==complaintId)
    );
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
              New message: <strong>{notif.from}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

