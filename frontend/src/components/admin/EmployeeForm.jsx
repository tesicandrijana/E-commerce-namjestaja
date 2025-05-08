import { useForm } from "react-hook-form";
import React, { useState } from 'react';
import './EmployeeForm.css';
import axios from "axios";

export default function App() {
  const { register, handleSubmit } = useForm();
  const [errorMessage, setErrorMessage] = useState(""); // Drži grešku koju treba prikazati

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.employee, // možeš i izostaviti ako backend defaultuje
    };

    console.log("Šaljem payload:", payload);

    try {
      const response = await axios.post("http://localhost:8000/users/signup", payload);
      console.log("Uspješno registrovan:", response.data);
      setErrorMessage("");  // Resetuj grešku ako je uspješno
    } catch (error) {
      console.error("Greška:", error);

      if (error.response?.data?.detail && error.response.data.detail.includes("Email already exists")) {
        setErrorMessage("Email already exists");
      } else {
        setErrorMessage(error.response?.data?.detail ? JSON.stringify(error.response.data.detail) : error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} placeholder="Full name" />
      <input {...register("email")} placeholder="Email" />
      <input {...register("password")} placeholder="Password" />
      <input {...register("phone")} placeholder="Phone" />

      <select {...register("employee")}>
        <option value="manager">Manager</option>
        <option value="support">Support</option>
        <option value="delivery">Delivery</option>
      </select>
      <input type="submit" />

      {errorMessage && <p>{errorMessage}</p>} {/* Prikazuje grešku ako postoji */}
    </form>
  );
}
