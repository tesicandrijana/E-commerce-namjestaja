import React, { useState } from "react";
import "./JoinOurTeam.css";
import UniversalModal from "../../../components/modals/UniversalModal";

export default function JoinOurTeam() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    cv: null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "cv") {
      setFormData((prev) => ({ ...prev, cv: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      role: formData.role,
    };

    try {
      const response = await fetch("http://localhost:8000/job-application/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit application");
      }

      const createdJobApp = await response.json();

      const formDataToSend = new FormData();
      formDataToSend.append("cv_file", formData.cv);

      const uploadResponse = await fetch(
        `http://localhost:8000/job-application/${createdJobApp.id}/upload-cv`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.detail || "Failed to upload CV");
      }

      setModalType("success");
      setModalTitle("Application Submitted");
      setModalMessage("Your application has been successfully submitted.");
      setIsModalOpen(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "",
        cv: null,
      });
    } catch (error) {
      setModalType("error");
      setModalTitle("Application Failed");
      setModalMessage(error.message || "An unexpected error occurred.");
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="join-form-container">
        <h3>Looking for a new job opportunity?</h3>
        <p>Become a part of our team and grow together with us!</p>
        <p>
          Fill out the form and send us your CV, we will review your application
          and get back to you as soon as possible
        </p>
      </div>

      <form onSubmit={handleSubmit} className="join-form">
        <h2>Join Our Team</h2>

        <label>
          Full Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </label>

        <label>
          Phone Number:
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
          />
        </label>

        <label>
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
          />
        </label>

        <label>
          Role:
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select a role</option>
            <option value="manager">Manager</option>
            <option value="delivery">Delivery</option>
            <option value="support">Support</option>
          </select>
        </label>

        <label>
          Upload CV:
          <input
            type="file"
            name="cv"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Submit Application</button>
      </form>

      <UniversalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
      />
    </>
  );
}
