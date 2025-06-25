import React, { useEffect, useState } from "react";
import axios from "axios";
import ConfirmModal from '../../components/modals/ConfirmModal';
import UniversalModal from '../../components/modals/UniversalModal';
import "./JobApplications.css";
import { HiDocumentDownload } from "react-icons/hi";

export default function UpcomingInterviewsTable() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const response = await axios.get("/job-application/interviews/upcoming");
        const sorted = response.data.sort(
          (a, b) => new Date(a.interview_time) - new Date(b.interview_time)
        );
        const withSendEmail = sorted.map((item) => ({ ...item, sendEmail: false }));
        setInterviews(withSendEmail);
      } catch (err) {
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setInterviews((prev) =>
      prev.map((interview) =>
        interview.id === id ? { ...interview, status: newStatus } : interview
      )
    );
  };

  const handleEmailCheckboxChange = (id) => {
    setInterviews((prev) =>
      prev.map((interview) =>
        interview.id === id
          ? { ...interview, sendEmail: !interview.sendEmail }
          : interview
      )
    );
  };

  const anyEmailChecked = interviews.some((interview) => interview.sendEmail);

  const updateStatusOnServer = async (id, status) => {
    if (status === "accepted") {
      return axios.post(`/job-application/${id}/approve`);
    } else if (status === "rejected") {
      return axios.post(`/job-application/${id}/reject`);
    } else {
      return Promise.resolve();
    }
  };

  const sendEmailsAndUpdateStatus = async () => {
    const toSend = interviews.filter((interview) => interview.sendEmail);

    try {
      for (const interview of toSend) {
        if (interview.status === "scheduled") {
          setModalType("error");
          setModalTitle("Warning");
          setModalMessage(
            `Candidate ${interview.name} status is still Scheduled. Please change status before sending email.`
          );
          setShowInfoModal(true);
          continue;
        }
        await updateStatusOnServer(interview.id, interview.status);
      }

      setModalType("success");
      setModalTitle("Success");
      setModalMessage(
        `Status updated and emails sent for ${toSend.length} candidate${toSend.length !== 1 ? "s" : ""}.`
      );
      setShowInfoModal(true);
    } catch (error) {
      setModalType("error");
      setModalTitle("Error");
      setModalMessage("Error sending emails: " + error.message);
      setShowInfoModal(true);
    }
  };

  const handleSendEmailsClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    sendEmailsAndUpdateStatus();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDownloadCv = async (id, fileName = "cv.pdf") => {
    try {
      const response = await axios.get(`/job-application/${id}/download-cv`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setModalType("error");
      setModalTitle("Error");
      setModalMessage("Failed to download CV.");
      setShowInfoModal(true);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
  <>
    <div className="upcoming-interviews-page">
      <h1 className="upcoming-interviews-title">Scheduled Interviews Overview</h1>
      <h5 className="upcoming-interviews-subtitle">
        This table presents a comprehensive overview of all upcoming interviews organized for candidates
      </h5>
      <p className="upcoming-interviews-description">
        You can monitor the interview details including candidate information, position applied for, and scheduled date and time.
        Additionally, use the status dropdown to update the current state of each interview, such as marking them as Accepted, Rejected, or still Scheduled.
      </p>

      {interviews.length === 0 ? (
        <p class="no-intweviews">
          No upcoming interviews.
        </p>
      ) : (
        <table className="upcoming-table">
          <thead>
            <tr>
              <th>CV</th>
              <th>Candidate</th>
              <th>Email</th>
              <th>Position</th>
              <th>Interview Date</th>
              <th>Status</th>
              <th>Send Email</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => (
              <tr key={interview.id}>
                <td>
                  <HiDocumentDownload
                    onClick={() => handleDownloadCv(interview.id, `${interview.name}_CV.pdf`)}
                    style={{
                      cursor: "pointer",
                      color: "#007bff",
                      fontSize: "1.5rem",
                    }}
                    title="Download CV"
                  />
                </td>
                <td>{interview.name}</td>
                <td>{interview.email}</td>
                <td>{interview.role}</td>
                <td>{new Date(interview.interview_time).toLocaleString()}</td>
                <td>
                  <select
                    value={interview.status}
                    onChange={(e) => handleStatusChange(interview.id, e.target.value)}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!interview.sendEmail}
                    onChange={() => handleEmailCheckboxChange(interview.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    {anyEmailChecked && (
      <button
        onClick={handleSendEmailsClick}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "30px",
          padding: "15px 25px",
          fontSize: "1rem",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          zIndex: 1000,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
      >
        Send Emails
      </button>
    )}

      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm Send Emails"
        message="Are you sure you want to send emails and update statuses for the selected candidates?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText="Yes"
        cancelText="No"
      />

      <UniversalModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
      />
    </>
  );

}
