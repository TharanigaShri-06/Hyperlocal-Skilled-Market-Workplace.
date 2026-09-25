import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorker } from "../services/workerService";
import Toast from "../components/Toast";
import "../styles/WorkerProfilePage.css";

function WorkerProfilePage() {
  const navigate = useNavigate();

  const [workerData, setWorkerData] = useState({
    skill: "",
    experience: "",
    location: "",
    availability: "AVAILABLE"
  });

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleChange = (e) => {
    setWorkerData({
      ...workerData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const savedUser =
        JSON.parse(localStorage.getItem("registeredUser")) ||
        JSON.parse(localStorage.getItem("loggedInUser"));

      if (!savedUser || !savedUser.userId) {
        showToast("Session not found. Please log in or register.", "error");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
        return;
      }

      const payload = {
        skill: workerData.skill,
        experience: Number(workerData.experience),
        location: workerData.location,
        availability: workerData.availability,
        rating: 3.0, // default rating
        user: {
          userId: savedUser.userId
        }
      };

      await createWorker(payload);

      localStorage.removeItem("registeredUser");
      showToast("Worker Profile Setup Successful!", "success");

      setTimeout(() => {
        // If already logged in, navigate straight to the dashboard.
        const loggedInUser = localStorage.getItem("loggedInUser");
        if (loggedInUser) {
          navigate("/worker");
        } else {
          // Fallback, but in practice loggedInUser is set during auto-login
          localStorage.setItem("loggedInUser", JSON.stringify(savedUser));
          navigate("/worker");
        }
      }, 1500);
    } catch (error) {
      console.error(error);
      showToast("Failed to save worker profile.", "error");
    }
  };

  return (
    <div className="profile-container">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      <h1 className="profile-title">Profile Setup</h1>
      <p className="profile-subtitle">
        Complete your professional profile to start receiving job proposals
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Primary Skill / Trade</label>
          <input
            type="text"
            name="skill"
            placeholder="ex: Electrician, Plumber, Carpenter"
            autoComplete="off"
            value={workerData.skill}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Years of Experience</label>
          <input
            type="number"
            name="experience"
            placeholder="ex: 5"
            autoComplete="off"
            value={workerData.experience}
            onChange={handleChange}
            required
            min="0"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Service Location / City</label>
          <input
            type="text"
            name="location"
            placeholder="ex: Coimbatore, Tamil Nadu"
            autoComplete="off"
            value={workerData.location}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Current Availability Status</label>
          <select
            name="availability"
            value={workerData.availability}
            onChange={handleChange}
            required
            className="form-input"
          >
            <option value="AVAILABLE">AVAILABLE (Open to work)</option>
            <option value="BUSY">BUSY (Currently occupied)</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">
          Save Profile & Continue
        </button>
      </form>
    </div>
  );
}

export default WorkerProfilePage;