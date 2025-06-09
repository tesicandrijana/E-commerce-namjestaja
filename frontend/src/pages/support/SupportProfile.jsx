import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./SupportProfile.css";

const SupportProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    password: ""
  });

  useEffect(() => {
    axios.get(`/support/profile/${id}`, { withCredentials: true })
      .then(res => {
        setUser(res.data);
        setEditData({
          name: res.data.name || "",
          password: ""
        });
      })
      .catch(err => console.error("Failed to fetch user profile", err));
  }, [id]);

  const handleEdit = () => setShowEdit(true);
  const handleCancel = () => setShowEdit(false);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
  const dataToSend = {};
  if (editData.name && editData.name.trim() !== "") {
    dataToSend.name = editData.name;
  }
  if (editData.password && editData.password.trim() !== "") {
    dataToSend.password = editData.password;
  }

  axios.put(`/support/profile/${id}`, dataToSend, { withCredentials: true })
    .then(res => {
      setUser(res.data);
      setShowEdit(false);
      setEditData({ ...editData, password: "" });
    })
    .catch(err => {
      console.error("Failed to update profile", err.response?.data || err.message);
    });
};


  if (!user) return <div>Loading profile...</div>;

  return (
    <main className="support-profile-container">
      <div className="profile-card-wrapper">
        <div className="profile-card-header">
          <img
            src="/support/avatar.png"
            alt="Profile avatar"
            className="profile-avatar"
          />
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

          <div className="info-row">
            <span className="info-label">Employee ID:</span>
            <span className="info-value">#{user.id}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Role:</span>
            <span className="info-value">{user.role}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Password:</span>
            <span className="info-value">••••••••</span>
          </div>

        </div>
      </div>

      {showEdit && (
        <div className="edit-modal">
          <div className="edit-form">
            <h2>Edit Your Profile</h2>
            <label>Full Name:</label>
            <input name="name" value={editData.name} onChange={handleChange} />

            <label>New password:</label>
            <input name="password" type="password" value={editData.password}
            onChange={handleChange} placeholder="Leave blank to keep current password"/>


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

export default SupportProfile;
