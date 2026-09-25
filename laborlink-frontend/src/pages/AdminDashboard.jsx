import { useEffect, useState } from "react";
import { getAllWorkers, createWorker } from "../services/workerService";
import { getAllBookings, acceptBooking, rejectBooking } from "../services/bookingService";
import { getUsersByAdmin, registerUserByAdmin, deleteUserByAdmin, updateUserByAdmin } from "../services/userService";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/AdminDashboard.css";
import { useNavigate } from "react-router-dom";

import { STATE_DISTRICTS } from "../services/locationData";

function AdminDashboard() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Tab navigation state: "overview", "bookings", "workers", "customers"
  const [currentTab, setCurrentTab] = useState("overview");

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  // Confirm Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetLabel, setDeleteTargetLabel] = useState("");

  // Create User Modal state
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [createUserType, setCreateUserType] = useState("WORKER"); // "WORKER" or "CUSTOMER"

  // Direct worker/customer creation form state
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    district: "",
    state: "",
    privateQuestion: "What city were you born in?",
    securityAnswer: "",
    // Worker specific
    skill: "Electrician",
    experience: "",
    availability: "AVAILABLE"
  });

  // Districts list for dropdown in user creation form
  const [creationDistricts, setCreationDistricts] = useState([]);

  const [showNewUserPassword, setShowNewUserPassword] = useState(false);

  // Worker bookings history & search states
  const [selectedWorkerHistory, setSelectedWorkerHistory] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [workerSearchQuery, setWorkerSearchQuery] = useState("");

  // Customer bookings history & search states
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [isCustomerHistoryModalOpen, setIsCustomerHistoryModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Worker actions & activity modal states
  const [selectedWorkerActions, setSelectedWorkerActions] = useState(null);
  const [isWorkerActionsModalOpen, setIsWorkerActionsModalOpen] = useState(false);

  // Total Bookings filter & sorting states
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [bookingSortOrder, setBookingSortOrder] = useState("RECENTS");
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    if (!loggedInUser || loggedInUser.role !== "ADMIN") {
      showToast("Unauthorized access. Admin privileges required.", "error");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const myUsers = await getUsersByAdmin(loggedInUser.email);
      setUsers(myUsers);

      const myUserIds = new Set(myUsers.map((u) => u.userId));
      const cleanAdminEmail = (loggedInUser?.email || "").toLowerCase();

      const allWorkers = await getAllWorkers();
      const myWorkers = allWorkers.filter(
        (w) =>
          (w.user && myUserIds.has(w.user.userId)) ||
          (w.user?.createdByAdminEmail && w.user.createdByAdminEmail.toLowerCase() === cleanAdminEmail) ||
          (w.user?.createdByAdminId && w.user.createdByAdminId === loggedInUser.userId) ||
          (w.user?.email && w.user.email.toLowerCase() === cleanAdminEmail)
      );
      setWorkers(myWorkers);

      const allBookings = await getAllBookings();
      const myWorkerUserIds = new Set(myWorkers.map((w) => w.user?.userId).filter(Boolean));
      const myWorkerIds = new Set(myWorkers.map((w) => w.workerId).filter(Boolean));
      const myBookings = allBookings.filter(
        (b) =>
          (b.customer && myUserIds.has(b.customer.userId)) ||
          (b.worker && myWorkerIds.has(b.worker.workerId)) ||
          (b.worker?.user && (myUserIds.has(b.worker.user.userId) || myWorkerUserIds.has(b.worker.user.userId)))
      );
      setBookings(myBookings);
    } catch (error) {
      console.error("Error loading admin dashboard data:", error);
    }
  };

  const handleAcceptBooking = async (bookingId, workerName) => {
    try {
      await acceptBooking(bookingId);
      showToast(`Job proposal for ${workerName || "worker"} accepted successfully!`, "success");
      loadData();
    } catch (error) {
      console.error("Error accepting booking proposal:", error);
      showToast("Failed to accept booking proposal.", "error");
    }
  };

  const handleRejectBooking = async (bookingId, workerName) => {
    try {
      await rejectBooking(bookingId);
      showToast(`Job proposal for ${workerName || "worker"} declined.`, "info");
      loadData();
    } catch (error) {
      console.error("Error rejecting booking proposal:", error);
      showToast("Failed to reject booking proposal.", "error");
    }
  };

  // Replaced window.confirm with Custom Confirm Modal
  const handleDeleteUserClick = (userId, userLabel) => {
    setDeleteTargetId(userId);
    setDeleteTargetLabel(userLabel);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    try {
      await deleteUserByAdmin(deleteTargetId, loggedInUser.email);
      showToast(`${deleteTargetLabel} deleted successfully.`, "success");
      loadData();
    } catch (error) {
      console.error(error);
      showToast("Failed to delete user.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  // State-district dropdown change handler for direct creation form
  const handleCreationStateChange = (e) => {
    const selectedState = e.target.value;
    const list = STATE_DISTRICTS[selectedState] || [];
    setCreationDistricts(list);
    setNewUserData((prev) => ({
      ...prev,
      state: selectedState,
      district: ""
    }));
  };

  const openCreateUserModal = (roleType) => {
    setCreateUserType(roleType);
    setCreationDistricts([]);
    setNewUserData({
      name: "",
      email: "",
      phone: "",
      password: "",
      city: "",
      district: "",
      state: "",
      privateQuestion: "What city were you born in?",
      securityAnswer: "",
      skill: "Electrician",
      experience: "",
      availability: "AVAILABLE"
    });
    setIsCreateUserModalOpen(true);
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newUserData.email) || newUserData.email.endsWith('.cm')) {
      showToast("Please enter a valid email address (invalid format).", "warning");
      return;
    }

    try {
      // 1. Create the User record under Admin's working email
      const userPayload = {
        name: newUserData.name,
        email: newUserData.email,
        phone: newUserData.phone,
        password: newUserData.password,
        city: newUserData.city,
        district: newUserData.district,
        state: newUserData.state,
        role: createUserType,
        privateQuestion: newUserData.privateQuestion,
        securityAnswer: newUserData.securityAnswer
      };

      const savedUser = await registerUserByAdmin(userPayload, loggedInUser.email);

      // 2. If role is WORKER, create their profile linking the user ID
      if (createUserType === "WORKER") {
        const workerPayload = {
          skill: newUserData.skill,
          experience: Number(newUserData.experience),
          location: `${newUserData.city}, ${newUserData.state}`,
          availability: newUserData.availability,
          rating: 3.0,
          user: {
            userId: savedUser.userId
          }
        };
        await createWorker(workerPayload);
      }

      showToast(`New ${createUserType === "WORKER" ? "Worker" : "Customer"} Registered under ${loggedInUser.email}!`, "success");
      setIsCreateUserModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error?.response?.data?.message || `Failed to create ${createUserType.toLowerCase()}.`, "error");
    }
  };

  // Filtered lists
  const customersList = users.filter((u) => u.role === "CUSTOMER");
  const adminsList = users.filter((u) => u.role === "ADMIN");

  const acceptedCount = bookings.filter((b) => b.status === "ACCEPTED").length;
  const rejectedCount = bookings.filter((b) => b.status === "REJECTED").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  // Top 20 recent bookings sorted by recents (newest booking ID first)
  const recent20Bookings = [...bookings]
    .sort((a, b) => b.bookingId - a.bookingId)
    .slice(0, 20);

  // Filtered & sorted total bookings list
  const filteredBookings = bookings
    .filter((b) => {
      if (bookingStatusFilter !== "ALL" && b.status !== bookingStatusFilter) {
        return false;
      }
      if (bookingSearchQuery.trim() !== "") {
        const q = bookingSearchQuery.toLowerCase();
        const bId = `#bk-${1000 + b.bookingId}`.toLowerCase();
        const cust = (b.customer?.name || "").toLowerCase();
        const wrk = (b.worker?.user?.name || "").toLowerCase();
        const desc = (b.workDescription || "").toLowerCase();
        return bId.includes(q) || cust.includes(q) || wrk.includes(q) || desc.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (bookingSortOrder === "RECENTS") {
        return b.bookingId - a.bookingId;
      } else {
        return a.bookingId - b.bookingId;
      }
    });

  return (
    <div className="admin-dashboard-layout">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      {/* Reusable Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${deleteTargetLabel}? This will remove all their associated records permanently.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* SIDEBAR PANEL */}
      <div className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="logo-pin">📍</div>
          <div className="brand-info">
            <h2>SkillLocal</h2>
            <small>Admin Panel</small>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li className={currentTab === "overview" ? "active" : ""} onClick={() => setCurrentTab("overview")}>
            <span className="nav-icon">📊</span> Dashboard
          </li>
          <li className={currentTab === "bookings" ? "active" : ""} onClick={() => setCurrentTab("bookings")}>
            <span className="nav-icon">💼</span> Bookings
          </li>
          <li className={currentTab === "workers" ? "active" : ""} onClick={() => setCurrentTab("workers")}>
            <span className="nav-icon">👷</span> Workers Directory
          </li>
          <li className={currentTab === "customers" ? "active" : ""} onClick={() => setCurrentTab("customers")}>
            <span className="nav-icon">👥</span> Customers Directory
          </li>
        </ul>

        <div className="sidebar-footer-profile">
          <div className="profile-info-row">
            <div className="profile-avatar">👤</div>
            <div className="profile-meta">
              <strong>{loggedInUser?.name || "Admin"}</strong>
              <p className="admin-role-badge">
                📧 {loggedInUser?.email}
              </p>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER CONTENT */}
      <div className="admin-main-content">
        
        {/* Content Header */}
        <div className="admin-header-row">
          <div className="header-greeting">
            <h1>Welcome, {loggedInUser?.name || "Admin"}! 👋</h1>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {currentTab === "overview" && (
          <div className="overview-tab-content">
            
            {/* Top Metrics Cards */}
            <div className="metrics-grid">
              <div className="metric-card shadow-blue">
                <div className="card-top">
                  <span className="card-icon">📅</span>
                  <span className="trend-percentage positive">↑ Active</span>
                </div>
                <h2>{bookings.length}</h2>
                <p>Total Bookings</p>
              </div>

              <div className="metric-card shadow-purple">
                <div className="card-top">
                  <span className="card-icon">👷</span>
                  <span className="trend-percentage positive">↑ Verified</span>
                </div>
                <h2>{workers.length}</h2>
                <p>Total Workers</p>
              </div>

              <div className="metric-card shadow-orange">
                <div className="card-top">
                  <span className="card-icon">👥</span>
                  <span className="trend-percentage positive">↑ Customers</span>
                </div>
                <h2>{customersList.length}</h2>
                <p>Total Customers</p>
              </div>
            </div>

            {/* Split Grid: Bookings Overview & Summaries */}
            <div className="dashboard-split-grid">
              
              {/* Left Column: Bookings Overview */}
              <div className="split-left-column">
                <div className="bookings-overview-card">
                  <div className="card-header">
                    <h3>Recent Bookings (20 Most Recent)</h3>
                    <button className="view-all-link" onClick={() => setCurrentTab("bookings")}>
                      View All Bookings &gt;
                    </button>
                  </div>

                  <div className="status-stats-row">
                    <div className="status-box-stat text-green">
                      <strong>{acceptedCount}</strong>
                      <p>Accepted</p>
                    </div>
                    <div className="status-box-stat text-orange">
                      <strong>{pendingCount}</strong>
                      <p>Pending</p>
                    </div>
                    <div className="status-box-stat text-red">
                      <strong>{rejectedCount}</strong>
                      <p>Rejected</p>
                    </div>
                  </div>

                  <div className="overview-table-container" style={{ maxHeight: "520px", overflowY: "auto" }}>
                    <table className="overview-bookings-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Customer</th>
                          <th>Worker</th>
                          <th>Service Date</th>
                          <th>Status</th>
                          <th style={{ textAlign: "center" }}>Proposal Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent20Bookings.map((booking) => (
                          <tr key={booking.bookingId}>
                            <td>#BK-{1000 + booking.bookingId}</td>
                            <td>{booking.customer?.name || "N/A"}</td>
                            <td>{booking.worker?.user?.name || "N/A"}</td>
                            <td>{booking.bookingDate}</td>
                            <td>
                              <span
                                className={`badge-indicator ${
                                  booking.status === "ACCEPTED"
                                    ? "accepted"
                                    : booking.status === "REJECTED"
                                    ? "rejected"
                                    : "pending"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {booking.status === "PENDING" ? (
                                <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                  <button
                                    onClick={() => handleAcceptBooking(booking.bookingId, booking.worker?.user?.name)}
                                    style={{
                                      padding: "5px 10px",
                                      background: "#16a34a",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "6px",
                                      fontWeight: "700",
                                      fontSize: "12px",
                                      cursor: "pointer"
                                    }}
                                  >
                                    ✓ Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectBooking(booking.bookingId, booking.worker?.user?.name)}
                                    style={{
                                      padding: "5px 10px",
                                      background: "#dc2626",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "6px",
                                      fontWeight: "700",
                                      fontSize: "12px",
                                      cursor: "pointer"
                                    }}
                                  >
                                    ✕ Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                                  {booking.status === "ACCEPTED" ? "Approved" : "Declined"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Summaries */}
              <div className="split-right-column">
                <div className="summary-pie-card">
                  <h3>Workers Summary</h3>
                  <div className="pie-mock-layout">
                    <div className="pie-graphic">👷</div>
                    <div className="pie-legends">
                      <div className="legend-row">
                        <span className="bullet blue"></span>
                        <p>Available Workers: <strong>{workers.filter(w => w.availability === "AVAILABLE").length}</strong></p>
                      </div>
                      <div className="legend-row">
                        <span className="bullet red"></span>
                        <p>Busy Workers: <strong>{workers.filter(w => w.availability !== "AVAILABLE").length}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="summary-pie-card" style={{ marginTop: "20px" }}>
                  <h3>Customers Summary</h3>
                  <div className="pie-mock-layout">
                    <div className="pie-graphic">👥</div>
                    <div className="pie-legends">
                      <div className="legend-row">
                        <span className="bullet purple"></span>
                        <p>Total Customers: <strong>{customersList.length}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Recent Workers, Recent Customers, Quick Actions */}
            <div className="bottom-tables-grid">
              
              <div className="bottom-card-item">
                <div className="card-header">
                  <h3>Recent Workers</h3>
                  <button className="view-all-link" onClick={() => setCurrentTab("workers")}>View All</button>
                </div>
                <table className="mini-data-table">
                  <thead>
                    <tr>
                      <th>Worker</th>
                      <th>Skill</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.slice(0, 4).map((worker) => (
                      <tr key={worker.workerId}>
                        <td><strong>{worker.user?.name}</strong></td>
                        <td className="text-orange">{worker.skill}</td>
                        <td>{worker.user?.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bottom-card-item">
                <div className="card-header">
                  <h3>Recent Customers</h3>
                  <button className="view-all-link" onClick={() => setCurrentTab("customers")}>View All</button>
                </div>
                <table className="mini-data-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email Address</th>
                      <th>City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersList.slice(0, 4).map((cust) => (
                      <tr key={cust.userId}>
                        <td><strong>{cust.name}</strong></td>
                        <td>{cust.email}</td>
                        <td>{cust.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Directly Create User Profiles from Dashboards (instead of front signup page alerts) */}
              <div className="bottom-card-item">
                <h3>Quick Actions</h3>
                <div className="quick-actions-list">
                  <button className="action-row-btn" onClick={() => openCreateUserModal("WORKER")}>
                    👷 Add New Worker Profile
                  </button>
                  <button className="action-row-btn" onClick={() => openCreateUserModal("CUSTOMER")}>
                    👥 Add New Customer Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS LIST */}
        {currentTab === "bookings" && (
          <div className="data-table-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2 style={{ margin: 0 }}>Global Booking Transaction Logs</h2>
                <small style={{ color: "#64748b", fontWeight: "500" }}>
                  Showing {filteredBookings.length} of {bookings.length} total bookings
                </small>
              </div>

              {/* Filter & Sorting Controls */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="🔍 Search customer, worker, ID..."
                  value={bookingSearchQuery}
                  onChange={(e) => setBookingSearchQuery(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "14px",
                    outline: "none",
                    width: "240px"
                  }}
                />

                {/* Status Filter */}
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "14px",
                    background: "white",
                    outline: "none",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  <option value="ALL">All Statuses ({bookings.length})</option>
                  <option value="ACCEPTED">Accepted ({acceptedCount})</option>
                  <option value="PENDING">Pending ({pendingCount})</option>
                  <option value="REJECTED">Rejected ({rejectedCount})</option>
                </select>

                {/* Recents & Date Sorting Filter */}
                <select
                  value={bookingSortOrder}
                  onChange={(e) => setBookingSortOrder(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "14px",
                    background: "white",
                    outline: "none",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  <option value="RECENTS">⏳ Most Recent First (Recents)</option>
                  <option value="OLDEST">📅 Oldest First</option>
                </select>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <p className="no-records-lbl">
                {bookings.length === 0 ? "No booking records found." : "No bookings match your selected filter criteria."}
              </p>
            ) : (
              <div className="premium-table-box">
                <table className="dashboard-data-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer Name</th>
                      <th>Worker Name</th>
                      <th>Job Description</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: "center" }}>Proposal Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.bookingId}>
                        <td>#BK-{1000 + booking.bookingId}</td>
                        <td className="bold-cell">{booking.customer?.name || "N/A"}</td>
                        <td className="bold-cell">{booking.worker?.user?.name || "N/A"}</td>
                        <td style={{ maxWidth: "240px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={booking.workDescription}>
                          {booking.workDescription}
                        </td>
                        <td>{booking.bookingDate}</td>
                        <td>
                          <span
                            className={`badge-indicator ${
                              booking.status === "ACCEPTED"
                                ? "accepted"
                                : booking.status === "REJECTED"
                                ? "rejected"
                                : "pending"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {booking.status === "PENDING" ? (
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button
                                onClick={() => handleAcceptBooking(booking.bookingId, booking.worker?.user?.name)}
                                style={{
                                  padding: "6px 12px",
                                  background: "#16a34a",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontWeight: "700",
                                  fontSize: "12px",
                                  cursor: "pointer"
                                }}
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleRejectBooking(booking.bookingId, booking.worker?.user?.name)}
                                style={{
                                  padding: "6px 12px",
                                  background: "#dc2626",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontWeight: "700",
                                  fontSize: "12px",
                                  cursor: "pointer"
                                }}
                              >
                                ✕ Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                              {booking.status === "ACCEPTED" ? "Approved" : "Declined"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WORKERS DIRECTORY */}
        {currentTab === "workers" && (
          <div className="data-table-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{ margin: 0 }}>Registered Workers Directory</h2>
              <input
                type="text"
                placeholder="🔍 Search worker by name or skill..."
                value={workerSearchQuery}
                onChange={(e) => setWorkerSearchQuery(e.target.value)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  fontSize: "14px",
                  width: "300px",
                  maxWidth: "100%",
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
              />
            </div>

            {workers.filter(w => 
              w.user?.name?.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
              w.skill?.toLowerCase().includes(workerSearchQuery.toLowerCase())
            ).length === 0 ? (
              <p className="no-records-lbl">
                {workers.length === 0 ? "No workers registered in the system yet." : "No workers match your search query."}
              </p>
            ) : (
              <div className="premium-table-box">
                <table className="dashboard-data-table">
                  <thead>
                    <tr>
                      <th>Worker ID</th>
                      <th>Name</th>
                      <th>Skill / Trade</th>
                      <th>Experience</th>
                      <th>Rating</th>
                      <th style={{ textAlign: "center" }}>Total Bookings</th>
                      <th>Location</th>
                      <th>Availability</th>
                      <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers
                      .filter(w => 
                        w.user?.name?.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
                        w.skill?.toLowerCase().includes(workerSearchQuery.toLowerCase())
                      )
                      .map((worker) => (
                        <tr key={worker.workerId}>
                          <td>#SKL-W{worker.workerId}</td>
                          <td className="bold-cell">{worker.user?.name || "N/A"}</td>
                          <td className="highlight-cell">{worker.skill}</td>
                          <td>{worker.experience} Years</td>
                          <td style={{ fontWeight: "bold", color: "#f59e0b" }}>⭐ {worker.rating ? worker.rating.toFixed(1) : "3.0"}</td>
                          <td style={{ textAlign: "center", fontWeight: "700", color: "var(--primary-light)" }}>
                            {bookings.filter(b => b.worker?.workerId === worker.workerId).length} Bookings
                          </td>
                          <td>
                            {worker.user?.city || "N/A"}, {worker.user?.state || "N/A"}
                            {worker.user?.district && <p className="small-district-lbl">{worker.user.district}</p>}
                          </td>
                          <td>
                            <span
                              className={`badge-indicator ${
                                worker.availability === "AVAILABLE" ? "accepted" : "rejected"
                              }`}
                            >
                              {worker.availability}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                              <button
                                className="btn-view-bookings"
                                onClick={() => {
                                  setSelectedWorkerHistory(worker);
                                  setIsHistoryModalOpen(true);
                                }}
                                style={{
                                  padding: "8px 12px",
                                  background: "var(--primary-light)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "700",
                                  fontSize: "13px",
                                  transition: "all 0.2s ease"
                                }}
                              >
                                View Bookings
                              </button>
                              <button
                                className="btn-worker-actions"
                                title="View All Worker Actions & Activity Log"
                                onClick={() => {
                                  setSelectedWorkerActions(worker);
                                  setIsWorkerActionsModalOpen(true);
                                }}
                                style={{
                                  padding: "8px 12px",
                                  background: "#0284c7",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "700",
                                  fontSize: "13px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  transition: "all 0.2s ease"
                                }}
                              >
                                ⚡ Actions
                              </button>
                              <button
                                className="btn-delete-record"
                                onClick={() => handleDeleteUserClick(worker.user?.userId, `Worker ${worker.user?.name}`)}
                                style={{ margin: 0 }}
                              >
                                Delete Profile
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMERS DIRECTORY */}
        {currentTab === "customers" && (
          <div className="data-table-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{ margin: 0 }}>Registered Customers Directory</h2>
              <input
                type="text"
                placeholder="🔍 Search customer by name or email..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  fontSize: "14px",
                  width: "300px",
                  maxWidth: "100%",
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
              />
            </div>

            {customersList.filter(c => 
              c.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
              c.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
            ).length === 0 ? (
              <p className="no-records-lbl">
                {customersList.length === 0 ? "No customers registered in the system yet." : "No customers match your search query."}
              </p>
            ) : (
              <div className="premium-table-box">
                <table className="dashboard-data-table">
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th style={{ textAlign: "center" }}>Total Bookings</th>
                      <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersList
                      .filter(c => 
                        c.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                        c.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
                      )
                      .map((cust) => (
                        <tr key={cust.userId}>
                          <td>#SKL-C{cust.userId}</td>
                          <td className="bold-cell">{cust.name}</td>
                          <td>{cust.email}</td>
                          <td>{cust.phone || "N/A"}</td>
                          <td>
                            {cust.city || "N/A"}, {cust.state || "N/A"}
                            {cust.district && <p className="small-district-lbl">{cust.district}</p>}
                          </td>
                          <td style={{ textAlign: "center", fontWeight: "700", color: "var(--primary-light)" }}>
                            {bookings.filter(b => b.customer?.userId === cust.userId).length} Bookings
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                              <button
                                className="btn-view-bookings"
                                onClick={() => {
                                  setSelectedCustomerHistory(cust);
                                  setIsCustomerHistoryModalOpen(true);
                                }}
                                style={{
                                  padding: "8px 14px",
                                  background: "var(--primary-light)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "700",
                                  fontSize: "13px",
                                  transition: "all 0.2s ease"
                                }}
                              >
                                View Bookings
                              </button>
                              <button
                                className="btn-delete-record"
                                onClick={() => handleDeleteUserClick(cust.userId, `Customer ${cust.name}`)}
                                style={{ margin: 0 }}
                              >
                                Delete User
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


        {/* TAB 6: MANAGE ADMINS (SUPERADMIN ONLY - DISABLED) */}
        {false && (
          <div className="admins-management-wrapper">
            
            {/* Left column: Admin List */}
            <div className="admin-list-container">
              <h2>Registered Admin Profiles</h2>
              
              {adminsList.length === 0 ? (
                <p className="no-records-lbl">No sub-admins created yet.</p>
              ) : (
                <div className="premium-table-box">
                  <table className="dashboard-data-table">
                    <thead>
                      <tr>
                        <th>Admin ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Location</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminsList.map((admin) => (
                        <tr key={admin.userId}>
                          <td>#SKL-A{admin.userId}</td>
                          <td className="bold-cell">{admin.name}</td>
                          <td>{admin.email}</td>
                          <td>{admin.city || "N/A"}, {admin.state || "N/A"}</td>
                          <td>
                            <button
                              className="btn-delete-record"
                              onClick={() => handleDeleteUserClick(admin.userId, `Admin ${admin.name}`)}
                            >
                              Delete Admin
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right column: Create Admin Form */}
            <div className="create-admin-form-panel">
              <h2>Create New Admin Profile</h2>
              <p className="panel-desc">Register a new system administrator for the platform.</p>

              <form onSubmit={handleCreateAdmin} className="admin-register-form">
                <div className="form-group-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    required
                    value={adminData.name}
                    onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                  />
                </div>

                <div className="form-group-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@skilllocal.com"
                    required
                    value={adminData.email}
                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  />
                </div>

                <div className="form-group-field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="10-digit mobile"
                    required
                    value={adminData.phone}
                    onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group-field">
                  <label>Password</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="Set temporary password"
                      required
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      style={{ width: "100%", paddingRight: "40px" }}
                    />
                    <span
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: "16px"
                      }}
                    >
                      {showAdminPassword ? "🔒" : "👁️"}
                    </span>
                  </div>
                </div>

                <div className="form-row-double">
                  <div className="form-group-field">
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={adminData.city}
                      onChange={(e) => setAdminData({ ...adminData, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group-field">
                    <label>State</label>
                    <select
                      value={adminData.state}
                      onChange={handleAdminStateChange}
                      style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)" }}
                      required
                    >
                      <option value="">Select state...</option>
                      {Object.keys(STATE_DISTRICTS).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group-field">
                  <label>District</label>
                  <select
                    value={adminData.district}
                    onChange={(e) => setAdminData({ ...adminData, district: e.target.value })}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)" }}
                    required
                    disabled={!adminData.state}
                  >
                    <option value="">Select district...</option>
                    {adminDistricts.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="admin-submit-btn">
                  Create Admin Profile
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* USER CREATION MODAL (For Admins and Super Admins to directly add customers/workers) */}
      {isCreateUserModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            
            <div className="admin-modal-header" style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>Register New {createUserType === "WORKER" ? "Skilled Worker Profile" : "Customer"}</h3>
                <button className="admin-modal-close" onClick={() => setIsCreateUserModalOpen(false)}>×</button>
              </div>
              <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: "700" }}>
                🔒 Managed & Tracked Under Admin: {loggedInUser?.name || "Admin"} ({loggedInUser?.email})
              </span>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="admin-register-form">
              
              <div className="form-row-double">
                <div className="form-group-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="ex: Ramesh Kumar"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="ex: user@example.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="form-row-double">
                <div className="form-group-field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="ex: 9876543210"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-field">
                  <label>Password</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type={showNewUserPassword ? "text" : "password"}
                      placeholder="ex: Enter password"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      style={{ width: "100%", paddingRight: "40px" }}
                      autoComplete="new-password"
                      required
                    />
                    <span
                      onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: "16px"
                      }}
                    >
                      {showNewUserPassword ? "🔒" : "👁️"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row-double">
                <div className="form-group-field">
                  <label>State</label>
                  <select
                    value={newUserData.state}
                    onChange={handleCreationStateChange}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)" }}
                    required
                  >
                    <option value="">Select state...</option>
                    {Object.keys(STATE_DISTRICTS).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-field">
                  <label>District</label>
                  <select
                    value={newUserData.district}
                    onChange={(e) => setNewUserData({ ...newUserData, district: e.target.value })}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)" }}
                    required
                    disabled={!newUserData.state}
                  >
                    <option value="">Select district...</option>
                    {creationDistricts.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-double">
                <div className="form-group-field">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="ex: Coimbatore"
                    value={newUserData.city}
                    onChange={(e) => setNewUserData({ ...newUserData, city: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-field">
                  <label>Security Answer (Born City)</label>
                  <input
                    type="text"
                    placeholder="ex: Coimbatore"
                    value={newUserData.securityAnswer}
                    onChange={(e) => setNewUserData({ ...newUserData, securityAnswer: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Worker Specific Fields */}
              {createUserType === "WORKER" && (
                <div style={{ background: "var(--bg)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h4 style={{ margin: 0, color: "var(--primary)" }}>Worker Professional Specifications</h4>
                  
                  <div className="form-row-double">
                    <div className="form-group-field">
                      <label>Trade / Skill</label>
                      <input
                        type="text"
                        placeholder="ex: Electrician, Plumber, Carpenter"
                        value={newUserData.skill}
                        onChange={(e) => setNewUserData({ ...newUserData, skill: e.target.value })}
                        required={createUserType === "WORKER"}
                      />
                    </div>

                    <div className="form-group-field">
                      <label>Years of Experience</label>
                      <input
                        type="number"
                        placeholder="ex: 5"
                        min="0"
                        value={newUserData.experience}
                        onChange={(e) => setNewUserData({ ...newUserData, experience: e.target.value })}
                        required={createUserType === "WORKER"}
                      />
                    </div>
                  </div>

                  <div className="form-row-double">
                    <div className="form-group-field">
                      <label>Current Status</label>
                      <select
                        value={newUserData.availability}
                        onChange={(e) => setNewUserData({ ...newUserData, availability: e.target.value })}
                        style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "white" }}
                        required={createUserType === "WORKER"}
                      >
                        <option value="AVAILABLE">AVAILABLE (Open to work)</option>
                        <option value="BUSY">BUSY (Occupied)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="admin-modal-footer">
                <button type="button" className="admin-modal-cancel" onClick={() => setIsCreateUserModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-modal-submit">
                  Save & Register Profile
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* WORKER BOOKING HISTORY MODAL */}
      {isHistoryModalOpen && selectedWorkerHistory && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: "800px", width: "90%" }}>
            <div className="admin-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3>Booking History - {selectedWorkerHistory.user?.name || "N/A"}</h3>
                <span style={{ background: "var(--primary-light)", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                  Total: {bookings.filter(b => b.worker?.workerId === selectedWorkerHistory.workerId).length} Bookings
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setIsHistoryModalOpen(false)}>×</button>
            </div>
            
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", background: "var(--bg)", padding: "15px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                <div>
                  <small style={{ color: "#94a3b8", display: "block" }}>Trade / Skill</small>
                  <strong>{selectedWorkerHistory.skill}</strong>
                </div>
                <div>
                  <small style={{ color: "#94a3b8", display: "block" }}>Experience</small>
                  <strong>{selectedWorkerHistory.experience} Years</strong>
                </div>
                <div>
                  <small style={{ color: "#94a3b8", display: "block" }}>Rating</small>
                  <strong>⭐ {selectedWorkerHistory.rating ? selectedWorkerHistory.rating.toFixed(1) : "3.0"}</strong>
                </div>
              </div>

              <div>
                <h4 style={{ margin: "0 0 10px", color: "var(--primary)" }}>Assigned Bookings List</h4>
                {bookings.filter(b => b.worker?.workerId === selectedWorkerHistory.workerId).length === 0 ? (
                  <p style={{ margin: 0, padding: "20px", textAlign: "center", background: "#f8fafc", borderRadius: "8px", color: "#64748b" }}>
                    No bookings have been assigned to this worker yet.
                  </p>
                ) : (
                  <div className="premium-table-box" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <table className="dashboard-data-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Customer</th>
                          <th>Service Date</th>
                          <th>Work Description</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th style={{ textAlign: "center" }}>Proposal Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings
                          .filter(b => b.worker?.workerId === selectedWorkerHistory.workerId)
                          .map((b) => (
                            <tr key={b.bookingId}>
                              <td>#BKG-{b.bookingId}</td>
                              <td className="bold-cell">{b.customer?.name || "N/A"}</td>
                              <td>{b.bookingDate}</td>
                              <td style={{ fontSize: "13px", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={b.workDescription}>
                                {b.workDescription}
                              </td>
                              <td>{b.location}</td>
                              <td>
                                <span className={`badge-indicator ${b.status === "ACCEPTED" ? "accepted" : b.status === "REJECTED" ? "rejected" : "pending"}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                {b.status === "PENDING" ? (
                                  <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                    <button
                                      onClick={() => handleAcceptBooking(b.bookingId, selectedWorkerHistory.user?.name)}
                                      style={{ padding: "5px 10px", background: "#16a34a", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                                    >
                                      ✓ Accept
                                    </button>
                                    <button
                                      onClick={() => handleRejectBooking(b.bookingId, selectedWorkerHistory.user?.name)}
                                      style={{ padding: "5px 10px", background: "#dc2626", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                                    >
                                      ✕ Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                                    {b.status === "ACCEPTED" ? "✅ Approved" : "❌ Declined"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-modal-cancel" onClick={() => setIsHistoryModalOpen(false)}>
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER BOOKING HISTORY MODAL */}
      {isCustomerHistoryModalOpen && selectedCustomerHistory && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: "800px", width: "90%" }}>
            <div className="admin-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3>Booking History - {selectedCustomerHistory.name}</h3>
                <span style={{ background: "var(--primary-light)", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                  Total: {bookings.filter(b => b.customer?.userId === selectedCustomerHistory.userId).length} Bookings
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setIsCustomerHistoryModalOpen(false)}>×</button>
            </div>
            
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h4 style={{ margin: "0 0 10px", color: "var(--primary)" }}>Bookings Created By Customer</h4>
                {bookings.filter(b => b.customer?.userId === selectedCustomerHistory.userId).length === 0 ? (
                  <p style={{ margin: 0, padding: "20px", textAlign: "center", background: "#f8fafc", borderRadius: "8px", color: "#64748b" }}>
                    No bookings have been made by this customer yet.
                  </p>
                ) : (
                  <div className="premium-table-box" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <table className="dashboard-data-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Assigned Worker</th>
                          <th>Service Date</th>
                          <th>Work Description</th>
                          <th>Location</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings
                          .filter(b => b.customer?.userId === selectedCustomerHistory.userId)
                          .map((b) => (
                            <tr key={b.bookingId}>
                              <td>#BKG-{b.bookingId}</td>
                              <td className="bold-cell">
                                {b.worker?.user?.name || "N/A"} ({b.worker?.skill || "N/A"})
                              </td>
                              <td>{b.bookingDate}</td>
                              <td style={{ fontSize: "13px", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={b.workDescription}>
                                {b.workDescription}
                              </td>
                              <td>{b.location}</td>
                              <td>
                                <span className={`badge-indicator ${b.status === "ACCEPTED" ? "accepted" : b.status === "REJECTED" ? "rejected" : "pending"}`}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-modal-cancel" onClick={() => setIsCustomerHistoryModalOpen(false)}>
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKER ACTIONS & ACTIVITY LOG MODAL */}
      {isWorkerActionsModalOpen && selectedWorkerActions && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: "850px", width: "92%" }}>
            <div className="admin-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "18px" }}>
                  ⚡ Worker Actions & Activity Log - {selectedWorkerActions.user?.name || "Worker"}
                </h3>
                <span className={`badge-indicator ${selectedWorkerActions.availability === "AVAILABLE" ? "accepted" : "rejected"}`}>
                  {selectedWorkerActions.availability}
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setIsWorkerActionsModalOpen(false)}>×</button>
            </div>
            
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", maxHeight: "75vh", overflowY: "auto" }}>
              
              {/* Worker Info Card */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", background: "var(--bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <div>
                  <small style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Worker ID</small>
                  <strong>#SKL-W{selectedWorkerActions.workerId}</strong>
                </div>
                <div>
                  <small style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Trade / Skill</small>
                  <strong style={{ color: "var(--primary)" }}>{selectedWorkerActions.skill}</strong>
                </div>
                <div>
                  <small style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Experience</small>
                  <strong>{selectedWorkerActions.experience} Years</strong>
                </div>
                <div>
                  <small style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Performance Rating</small>
                  <strong style={{ color: "#f59e0b" }}>⭐ {selectedWorkerActions.rating ? selectedWorkerActions.rating.toFixed(1) : "3.0"}</strong>
                </div>
                <div>
                  <small style={{ color: "#64748b", display: "block", fontSize: "12px" }}>Contact Email / Phone</small>
                  <strong style={{ fontSize: "13px" }}>{selectedWorkerActions.user?.email}</strong>
                  <br />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>📞 {selectedWorkerActions.user?.phone || "N/A"}</span>
                </div>
              </div>

              {/* Action Summary Counters */}
              {(() => {
                const wBookings = bookings.filter(b => b.worker?.workerId === selectedWorkerActions.workerId);
                const wAccepted = wBookings.filter(b => b.status === "ACCEPTED").length;
                const wPending = wBookings.filter(b => b.status === "PENDING").length;
                const wRejected = wBookings.filter(b => b.status === "REJECTED").length;
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
                      <span style={{ fontSize: "20px", fontWeight: "800", color: "#16a34a" }}>{wAccepted}</span>
                      <p style={{ margin: 0, fontSize: "12px", color: "#15803d", fontWeight: "600" }}>Accepted Actions</p>
                    </div>
                    <div style={{ background: "#fffbebe1", border: "1px solid #fde68a", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
                      <span style={{ fontSize: "20px", fontWeight: "800", color: "#d97706" }}>{wPending}</span>
                      <p style={{ margin: 0, fontSize: "12px", color: "#b45309", fontWeight: "600" }}>Pending Actions</p>
                    </div>
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
                      <span style={{ fontSize: "20px", fontWeight: "800", color: "#dc2626" }}>{wRejected}</span>
                      <p style={{ margin: 0, fontSize: "12px", color: "#b91c1c", fontWeight: "600" }}>Rejected Actions</p>
                    </div>
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
                      <span style={{ fontSize: "20px", fontWeight: "800", color: "#2563eb" }}>{wBookings.length}</span>
                      <p style={{ margin: 0, fontSize: "12px", color: "#1d4ed8", fontWeight: "600" }}>Total Jobs Assigned</p>
                    </div>
                  </div>
                );
              })()}

              {/* Detailed Action Timeline & Booking Activity */}
              <div>
                <h4 style={{ margin: "0 0 12px", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  📜 Worker Activity Timeline & Actions Log
                </h4>
                {(() => {
                  const wBookings = bookings.filter(b => b.worker?.workerId === selectedWorkerActions.workerId);
                  if (wBookings.length === 0) {
                    return (
                      <div style={{ padding: "24px", textAlign: "center", background: "#f8fafc", borderRadius: "10px", color: "#64748b", border: "1px dashed #cbd5e1" }}>
                        <span style={{ fontSize: "24px", display: "block", marginBottom: "6px" }}>📜</span>
                        <strong>No action records found.</strong>
                        <p style={{ margin: "4px 0 0", fontSize: "13px" }}>This worker has not received any job requests or performed actions yet.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="premium-table-box" style={{ maxHeight: "320px", overflowY: "auto" }}>
                      <table className="dashboard-data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Action Event</th>
                            <th>Customer</th>
                            <th>Job Description</th>
                            <th>Location</th>
                            <th>Action Status</th>
                            <th style={{ textAlign: "center" }}>Manage Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wBookings.map((b) => (
                            <tr key={b.bookingId}>
                              <td style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>{b.bookingDate}</td>
                              <td>
                                <span style={{
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  background: b.status === "ACCEPTED" ? "#dcfce7" : b.status === "REJECTED" ? "#fee2e2" : "#fef3c7",
                                  color: b.status === "ACCEPTED" ? "#15803d" : b.status === "REJECTED" ? "#b91c1c" : "#b45309"
                                }}>
                                  {b.status === "ACCEPTED" ? "✅ Accepted Job" : b.status === "REJECTED" ? "❌ Declined Job" : "⏳ Pending Response"}
                                </span>
                              </td>
                              <td className="bold-cell">{b.customer?.name || "N/A"}</td>
                              <td style={{ fontSize: "13px", maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={b.workDescription}>
                                {b.workDescription}
                              </td>
                              <td style={{ fontSize: "13px" }}>{b.location}</td>
                              <td>
                                <span className={`badge-indicator ${b.status === "ACCEPTED" ? "accepted" : b.status === "REJECTED" ? "rejected" : "pending"}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                {b.status === "PENDING" ? (
                                  <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                    <button
                                      onClick={() => handleAcceptBooking(b.bookingId, selectedWorkerActions.user?.name)}
                                      style={{ padding: "4px 8px", background: "#16a34a", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                                    >
                                      ✓ Accept
                                    </button>
                                    <button
                                      onClick={() => handleRejectBooking(b.bookingId, selectedWorkerActions.user?.name)}
                                      style={{ padding: "4px 8px", background: "#dc2626", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                                    >
                                      ✕ Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                                    {b.status === "ACCEPTED" ? "Approved by Admin" : "Declined by Admin"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-modal-cancel" onClick={() => setIsWorkerActionsModalOpen(false)}>
                Close Action History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
