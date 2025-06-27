import React from "react";
import "./UniversalModal.css";
import { AiOutlineCheckCircle, AiOutlineExclamationCircle } from "react-icons/ai";

const UniversalModal = ({ isOpen, onClose, type, title, message }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content">
        
        <div className={`custom-modal-icon ${isSuccess ? "success" : "error"}`}>
          {isSuccess ? (
            <AiOutlineCheckCircle size={32} />
          ) : (
            <AiOutlineExclamationCircle size={32} />
          )}
        </div>

        <h2>{title}</h2>
        <p>{message}</p>

        <div className="custom-modal-buttons">
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default UniversalModal;
