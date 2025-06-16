import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./DeliveryProfile.css";

const DeliveryProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    axios.get(`/delivery/profile/${id}`, { withCredentials: true }) 
      .then(res => {
        setUser(res.data);
        setEditData({
          name: res.data.name || "",
          phone: res.data.phone || "",
          about: res.data.about || "",
        });
      })
      .catch(err => console.error("Failed to fetch delivery profile", err));
  }, [id]);

  const handleEdit = () => setShowEdit(true);
  const handleCancel = () => setShowEdit(false);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios.put(`/delivery/profile/${id}`, editData, { withCredentials: true }) 
      .then(res => {
        setUser(res.data);
        setShowEdit(false);
      })
      .catch(err => console.error("Failed to update delivery profile", err));
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <main className="support-profile-container">
      <div className="profile-card-wrapper">
        <div className="profile-card-header no-avatar">
          <div className="profile-basic-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
          <button className="edit-button" onClick={handleEdit}>
            Edit Profile
          </button>
        </div>

        <div className="profile-details-section">
          <h3>About</h3>
          <p>{user.about || "No bio added yet."}</p>

          <div className="info-row">
            <span className="info-label">Employee ID:</span>
            <span className="info-value">#{user.id}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Role:</span>
            <span className="info-value">{user.role}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Phone:</span>
            <span className="info-value">{user.phone || "Not set"}</span>
          </div>
        </div>
      </div>

      {showEdit && (
        <div className="edit-modal">
          <div className="edit-form">
            <h2>Edit Your Profile</h2>
            <label>Full Name:</label>
            <input name="name" value={editData.name} onChange={handleChange} />

            <label>Phone:</label>
            <input name="phone" value={editData.phone} onChange={handleChange} />

            <label>About:</label>
            <textarea name="about" value={editData.about} onChange={handleChange} />

            <div className="edit-buttons">
              <button onClick={handleSave}>Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default DeliveryProfile;
