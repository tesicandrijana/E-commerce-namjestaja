import React from 'react';
import './SupportFooter.css';

const SupportFooter = () => {
  return (
    <footer className="support-footer">
      <div className="support-footer-content">
        <span>© {new Date().getFullYear()} FurniStyle - Employee</span>
        <span>Internal Use Only | Version 1.0</span>
      </div>
    </footer>
  );
};

export default SupportFooter;
