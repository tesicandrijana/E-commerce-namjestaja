import React, { useState } from "react";
import "./JoinOurTeam.css";

export default function JoinOurTeam() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    cv: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "cv") {
      setFormData((prev) => ({ ...prev, cv: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form submitted:", formData);

    alert("Thank you for joining our team! We will review your application.");
    setFormData({
      fullname: "",
      email: "",
      phone: "",
      address: "",
      role: "",
      cv: null,
    });
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
            name="fullname"
            value={formData.fullname}
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
    </>
  );
}
