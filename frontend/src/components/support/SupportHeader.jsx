import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../auth/AuthProvider";
import "./SupportHeader.css";
import Notification from "../Notification";

const SupportHeader = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const[currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/users/me", { 
        withCredentials: true 
      })
      .then((res) => setCurrentUser(res.data))
      .catch((err) => {
        setCurrentUser(null);
        console.error("Greska pri dohvacanju korisnika:", err);
        })
  }, []);

  return (
    <header className="support-header">
      <div className="support-header-container">
        <Link to="/support" className="support-logo">
          FurniStyle - Employee
        </Link>
        <nav className="support-nav">
          <Link to="/support/complaints" className="support-btn complaints-btn">
            Complaints
          </Link>
          <Link to="/support/orders" className="support-btn orders-btn">
            Orders
          </Link>
         
          <Link to="/support/inquiries" className="support-btn inquiries-btn">
            Inquiries
          </Link>
          {/* dodano jer je bacalo gresku - ako currentUser === null jer ses jos ucitava s backenda*/}
          {currentUser && (     
            <Link to={`/support/profile/${currentUser.id}`} className="support-btn profile-btn">
              My Profile
            </Link>
          )}
          <Notification currentUser={currentUser} />
          <button
            onClick={() => {
              handleLogout();
              navigate("/");
            }}
            className="support-btn logout-btn">
            <FaSignOutAlt style={{ marginRight: "5px" }} /> Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default SupportHeader;
