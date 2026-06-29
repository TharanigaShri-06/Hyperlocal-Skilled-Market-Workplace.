import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getWorkerBookings, acceptBooking, rejectBooking } from "../services/bookingService";
import { getWorkerByUserId, updateAvailability } from "../services/workerService";
import Toast from "../components/Toast";
import "../styles/WorkerDashboard.css";

function WorkerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("proposals"); // "proposals" or "history"

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    loadWorkerAndBookings();
  }, []);

  const loadWorkerAndBookings = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!loggedInUser) return;

      const worker = await getWorkerByUserId(loggedInUser.userId);
      setWorkerProfile(worker);

      if (worker && worker.workerId) {
        const data = await getWorkerBookings(worker.workerId);
        setBookings(data);
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      await acceptBooking(bookingId);
      showToast("Proposal Accepted Successfully! Customer has been notified.", "success");
      loadWorkerAndBookings();
    } catch (error) {
      console.error(error);
      showToast("Failed to accept booking.", "error");
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await rejectBooking(bookingId);
      showToast("Proposal Rejected.", "info");
      loadWorkerAndBookings();
    } catch (error) {
      console.error(error);
      showToast("Failed to reject booking.", "error");
    }
  };

  // Filter proposals
  const pendingProposals = bookings.filter((b) => b.status === "PENDING");
  const historyProposals = bookings.filter((b) => b.status === "ACCEPTED" || b.status === "REJECTED");

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}
        
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-title">
            <h1>Worker Dashboard</h1>
            <p>
              Welcome back, <strong style={{ color: "#ff6600" }}>{workerProfile?.user?.name || "Professional"}</strong>! Manage your requests.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="stats-panel">
            <div className="stat-badge">
              <div className="stat-label">Active Offers</div>
              <div className="stat-value">{pendingProposals.length}</div>
            </div>
            <div className="stat-badge">
              <div className="stat-label">Completed Jobs</div>
              <div className="stat-value">
                {bookings.filter((b) => b.status === "ACCEPTED").length}
              </div>
            </div>
            <div className="stat-badge">
              <div className="stat-label">Average Rating</div>
              <div className="stat-value" style={{ color: "#f59e0b" }}>
                ⭐ {workerProfile?.rating ? workerProfile.rating.toFixed(1) : "5.0"}
              </div>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="availability-toggle-box" style={{ background: "white", padding: "18px 24px", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 4px 20px rgba(15, 43, 70, 0.03)", marginBottom: "30px" }}>
          <span style={{ fontSize: "28px" }}>⚡</span>
          <div>
            <strong style={{ display: "block", fontSize: "16px", color: "var(--text-h)", marginBottom: "4px" }}>
              My Availability Status: <span style={{ color: workerProfile?.availability === "AVAILABLE" ? "var(--success)" : "var(--danger)", fontWeight: "800" }}>{workerProfile?.availability || "AVAILABLE"}</span>
            </strong>
            <small style={{ color: "var(--text)", fontSize: "13px" }}>Toggle your status to control if customers can book you.</small>
          </div>
          <button
            onClick={async () => {
              if (!workerProfile || !workerProfile.workerId) return;
              const newStatus = workerProfile?.availability === "AVAILABLE" ? "BUSY" : "AVAILABLE";
              try {
                const updated = await updateAvailability(workerProfile.workerId, newStatus);
                setWorkerProfile(updated);
                showToast(`Status updated to ${newStatus}!`, "success");
              } catch (err) {
                console.error(err);
                showToast("Failed to update status.", "error");
              }
            }}
            style={{
              marginLeft: "auto",
              padding: "10px 20px",
              background: workerProfile?.availability === "AVAILABLE" ? "var(--danger)" : "var(--success)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Switch to {workerProfile?.availability === "AVAILABLE" ? "BUSY" : "AVAILABLE"}
          </button>
        </div>


        {/* Tab Selection */}
        <div className="dashboard-tabs">
          <button
            onClick={() => setActiveTab("proposals")}
            className={`tab-btn ${activeTab === "proposals" ? "active" : ""}`}
          >
            Active Proposals ({pendingProposals.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          >
            Proposals History ({historyProposals.length})
          </button>
        </div>

        {/* ACTIVE PROPOSALS TAB */}
        {activeTab === "proposals" && (
          <div>
            <h2 style={{ fontSize: "22px", color: "#082567", fontWeight: "800", marginBottom: "20px" }}>
              Incoming Job Proposals
            </h2>

            {pendingProposals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", color: "#64748b", background: "#f8fafc", borderRadius: "16px" }}>
                🎉 You don't have any pending proposals right now. We will notify you when a customer requests your service!
              </div>
            ) : (
              <div className="proposals-list">
                {pendingProposals.map((booking) => (
                  <div key={booking.bookingId} className="proposal-card">
                    <div className="proposal-card-header">
                      <div>
                        <h3 className="customer-name">
                          👤 {booking.customer?.name || "Customer"}
                        </h3>
                        <p className="customer-meta">
                          📍 {booking.customer?.city || "N/A"}, {booking.customer?.state || "N/A"} | 📞 {booking.customer?.phone || "N/A"}
                        </p>
                      </div>
                      <span className="status-badge pending">
                        PENDING
                      </span>
                    </div>

                    <div className="proposal-description-box">
                      <h4 className="description-title">
                        Job Description / Customer Request
                      </h4>
                      <p className="description-text">
                        {booking.workDescription || "General Service Request"}
                      </p>
                    </div>

                    <div className="proposal-date">
                      📅 <strong>Requested Date:</strong> {booking.bookingDate || "N/A"}
                    </div>

                    <div className="action-buttons">
                      <button
                        onClick={() => handleAccept(booking.bookingId)}
                        className="accept-btn"
                      >
                        Accept Offer
                      </button>
                      <button
                        onClick={() => handleReject(booking.bookingId)}
                        className="reject-btn"
                      >
                        Reject Offer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROPOSALS HISTORY TAB */}
        {activeTab === "history" && (
          <div>
            <h2 style={{ fontSize: "22px", color: "#082567", fontWeight: "800", marginBottom: "20px" }}>
              Proposal History Log
            </h2>

            {historyProposals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b", background: "#f8fafc", borderRadius: "16px" }}>
                No past proposals recorded.
              </div>
            ) : (
              <div className="history-list">
                {historyProposals.map((booking) => (
                  <div key={booking.bookingId} className="history-card">
                    <div className="customer-info">
                      <h4>{booking.customer?.name || "Customer"}</h4>
                      <div>
                        📍 {booking.customer?.city || "N/A"}, {booking.customer?.state || "N/A"}
                      </div>
                    </div>

                    <div className="desc-col">
                      <span className="col-label">Job Description</span>
                      <span className="col-value">{booking.workDescription || "N/A"}</span>
                    </div>

                    <div className="date-col">
                      <span className="col-label">Booking Date</span>
                      <span className="col-value">{booking.bookingDate || "N/A"}</span>
                    </div>

                    <div className="rating-col">
                      <span className="col-label">Rating Received</span>
                      <span className="col-value">
                        {booking.rating && booking.rating > 0 ? (
                          <span style={{ color: "#f59e0b", fontWeight: "800" }}>
                            ⭐ {booking.rating.toFixed(1)}
                          </span>
                        ) : booking.status === "ACCEPTED" ? (
                          <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>Not rated yet</span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </span>
                    </div>

                    <div className="status-col">
                      <span
                        className={`status-badge ${
                          booking.status === "ACCEPTED" ? "accepted" : "rejected"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default WorkerDashboard;
