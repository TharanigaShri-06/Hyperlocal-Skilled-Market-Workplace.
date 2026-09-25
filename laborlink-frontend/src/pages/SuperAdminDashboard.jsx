import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  registerUser,
  deleteUser,
  createAdmin,
  deleteAdmin,
  getAdminStats
} from "../services/userService";
import { getAllWorkers, createWorker } from "../services/workerService";
import { getAllBookings } from "../services/bookingService";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { STATE_DISTRICTS } from "../services/locationData";
import "../styles/SuperAdminDashboard.css";

function SuperAdminDashboard() {
  const navigate = useNavigate();

  // Primary Data
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [adminStats, setAdminStats] = useState([]);

  // Active Tab: "overview", "workers", "customers", "bookings", "admins"
  const [currentTab, setCurrentTab] = useState("overview");

  // Create Admin Modal State
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    district: "",
    state: "",
    privateQuestion: "What city were you born in?",
    securityAnswer: "SuperAdmin"
  });
  const [adminCreationDistricts, setAdminCreationDistricts] = useState([]);

  // Notifications & Confirm Modals
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, type: "", label: "" });

  // Create User Modal (Worker / Customer)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [createUserType, setCreateUserType] = useState("WORKER"); // "WORKER" or "CUSTOMER"
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    district: "",
    state: "",
    privateQuestion: "What city were you born in?",
    securityAnswer: "SuperAdmin",
    skill: "Electrician",
    experience: "",
    availability: "AVAILABLE"
  });
  const [creationDistricts, setCreationDistricts] = useState([]);

  // Search queries
  const [workerSearch, setWorkerSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);

  // Worker actions & activity modal states
  const [selectedWorkerActions, setSelectedWorkerActions] = useState(null);
  const [isWorkerActionsModalOpen, setIsWorkerActionsModalOpen] = useState(false);

  // Bookings filter & sorting states
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
    if (!loggedInUser || (loggedInUser.role !== "SUPERADMIN" && loggedInUser.role !== "ADMIN")) {
      showToast("Unauthorized access. SuperAdmin privileges required.", "error");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);

      const allWorkers = await getAllWorkers();
      setWorkers(allWorkers);

      const allBookings = await getAllBookings();
      setBookings(allBookings);

      const stats = await getAdminStats();
      setAdminStats(stats);
    } catch (error) {
      console.error("Error loading SuperAdmin data:", error);
    }
  };

  const handleAdminCreationStateChange = (e) => {
    const selectedState = e.target.value;
    const list = STATE_DISTRICTS[selectedState] || [];
    setAdminCreationDistricts(list);
    setNewAdminData((prev) => ({
      ...prev,
      state: selectedState,
      district: list[0] || ""
    }));
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newAdminData.email)) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }
    if (!newAdminData.phone || !/^\d{10}$/.test(newAdminData.phone)) {
      showToast("Phone number must contain exactly 10 digits.", "warning");
      return;
    }

    try {
      await createAdmin(newAdminData);
      showToast(`New Admin Account (${newAdminData.email}) Created Successfully!`, "success");
      setIsCreateAdminModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error?.response?.data?.message || "Failed to create Admin account.", "error");
    }
  };

  const handleCreationStateChange = (e) => {
    const selectedState = e.target.value;
    const list = STATE_DISTRICTS[selectedState] || [];
    setCreationDistricts(list);
    setNewUserData((prev) => ({
      ...prev,
      state: selectedState,
      district: list[0] || ""
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
      securityAnswer: "SuperAdmin",
      skill: "Electrician",
      experience: "",
      availability: "AVAILABLE"
    });
    setIsCreateUserModalOpen(true);
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newUserData.email)) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }
    if (!newUserData.phone || !/^\d{10}$/.test(newUserData.phone)) {
      showToast("Phone number must contain exactly 10 digits.", "warning");
      return;
    }

    try {
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

      const savedUser = await registerUser(userPayload);

      if (createUserType === "WORKER") {
        const workerPayload = {
          skill: newUserData.skill,
          experience: Number(newUserData.experience || 1),
          location: `${newUserData.city}, ${newUserData.state}`,
          availability: newUserData.availability,
          rating: 5.0,
          user: {
            userId: savedUser.userId
          }
        };
        await createWorker(workerPayload);
      }

      showToast(`New ${createUserType === "WORKER" ? "Worker" : "Customer"} Profile Created Successfully!`, "success");
      setIsCreateUserModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error?.response?.data?.message || "Failed to create profile.", "error");
    }
  };

  const handleDeleteClick = (id, type, label) => {
    setDeleteTarget({ id, type, label });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    try {
      if (deleteTarget.type === "ADMIN") {
        await deleteAdmin(deleteTarget.id);
      } else {
        await deleteUser(deleteTarget.id);
      }
      showToast(`${deleteTarget.label} deleted successfully.`, "success");
      loadData();
    } catch (error) {
      console.error("Error deleting target:", error);
      showToast(error?.response?.data?.message || "Failed to delete record.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

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
        const bId = `#${b.bookingId}`.toLowerCase();
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
    <div className="superadmin-layout">
      {/* Toast Notification */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <ConfirmModal
          isOpen={confirmOpen}
          title={`Delete ${deleteTarget.type}`}
          message={`Are you sure you want to permanently delete "${deleteTarget.label}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      {/* SIDEBAR PANEL */}
      <div className="superadmin-sidebar">
        <div className="sidebar-brand">
          <div className="logo-badge">👑</div>
          <div className="brand-info">
            <h2>SuperAdmin</h2>
            <small>SkillLocal Central Panel</small>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li
            className={currentTab === "overview" ? "active" : ""}
            onClick={() => setCurrentTab("overview")}
          >
            <span className="nav-icon">📊</span> Overview
          </li>
          <li
            className={currentTab === "admins" ? "active" : ""}
            onClick={() => setCurrentTab("admins")}
          >
            <span className="nav-icon">🔑</span> Manage Admins ({adminsList.length})
          </li>
          <li
            className={currentTab === "workers" ? "active" : ""}
            onClick={() => setCurrentTab("workers")}
          >
            <span className="nav-icon">👷</span> Workers ({workers.length})
          </li>
          <li
            className={currentTab === "customers" ? "active" : ""}
            onClick={() => setCurrentTab("customers")}
          >
            <span className="nav-icon">👥</span> Customers ({customersList.length})
          </li>
          <li
            className={currentTab === "bookings" ? "active" : ""}
            onClick={() => setCurrentTab("bookings")}
          >
            <span className="nav-icon">📅</span> All Bookings ({bookings.length})
          </li>
        </ul>

        <div className="sidebar-footer-profile">
          <div className="profile-avatar">👑</div>
          <div className="profile-meta">
            <strong>{loggedInUser?.name || "SuperAdmin"}</strong>
            <p>System Controller</p>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER CONTENT */}
      <div className="superadmin-main">
        {/* Header */}
        <div className="content-header">
          <div className="header-title-box">
            <h1>SuperAdmin Dashboard ⚡</h1>
            <p>Full control over platform workers, customers, admins, and booking activity.</p>
          </div>

          <div className="quick-metrics-row">
            <div className="metric-badge warning" onClick={() => setCurrentTab("admins")} style={{ cursor: "pointer" }}>
              <span className="badge-icon">🔑</span>
              <div>
                <p>System Admins</p>
                <strong>{adminsList.length}</strong>
              </div>
            </div>
            <div className="metric-badge primary">
              <span className="badge-icon">👷</span>
              <div>
                <p>Total Workers</p>
                <strong>{workers.length}</strong>
              </div>
            </div>
            <div className="metric-badge accent">
              <span className="badge-icon">👥</span>
              <div>
                <p>Total Customers</p>
                <strong>{customersList.length}</strong>
              </div>
            </div>
            <div className="metric-badge info">
              <span className="badge-icon">💼</span>
              <div>
                <p>Total Bookings</p>
                <strong>{bookings.length}</strong>
              </div>
            </div>
            <div className="metric-badge success">
              <span className="badge-icon">✅</span>
              <div>
                <p>Accepted Jobs</p>
                <strong>{acceptedCount}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {currentTab === "overview" && (
          <div className="tab-section fade-in">
            <div className="section-header-bar">
              <div>
                <h2>Marketplace Summary</h2>
                <p>Overall system activity and job request statuses.</p>
              </div>
              <div className="header-right-actions">
                <button className="action-btn primary-btn" onClick={() => openCreateUserModal("WORKER")}>
                  ➕ Add New Worker
                </button>
                <button className="action-btn secondary-btn" onClick={() => openCreateUserModal("CUSTOMER")}>
                  ➕ Add New Customer
                </button>
              </div>
            </div>

            <div className="status-stats-grid">
              <div className="status-box accepted-box">
                <span className="status-icon">✅</span>
                <div>
                  <strong>{acceptedCount}</strong>
                  <p>Accepted Bookings</p>
                </div>
              </div>
              <div className="status-box pending-box">
                <span className="status-icon">⏳</span>
                <div>
                  <strong>{pendingCount}</strong>
                  <p>Pending Proposals</p>
                </div>
              </div>
              <div className="status-box rejected-box">
                <span className="status-icon">❌</span>
                <div>
                  <strong>{rejectedCount}</strong>
                  <p>Rejected Proposals</p>
                </div>
              </div>
            </div>

            <div className="recent-activity-card">
              <h3>Recent Booking Requests (20 Most Recent)</h3>
              <div className="table-wrapper" style={{ maxHeight: "480px", overflowY: "auto" }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Worker</th>
                      <th>Description</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent20Bookings.map((b) => (
                      <tr key={b.bookingId}>
                        <td>#{b.bookingId}</td>
                        <td>{b.customer?.name || "Customer"}</td>
                        <td>{b.worker?.user?.name || "Worker"}</td>
                        <td>"{b.workDescription}"</td>
                        <td>{b.location || "N/A"}</td>
                        <td>
                          <span className={`status-pill ${b.status?.toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORKERS */}
        {currentTab === "workers" && (
          <div className="tab-section fade-in">
            <div className="section-header-bar">
              <div>
                <h2>Skilled Workers Directory</h2>
                <p>Inspect, add, or manage skilled workers registered on SkillLocal.</p>
              </div>
              <div className="header-right-actions">
                <input
                  type="text"
                  placeholder="🔍 Search workers by name or skill..."
                  className="search-input"
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                />
                <button className="action-btn primary-btn" onClick={() => openCreateUserModal("WORKER")}>
                  ➕ Add New Worker
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Email</th>
                    <th>Skill</th>
                    <th>Experience</th>
                    <th>Location</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers
                    .filter(
                      (w) =>
                        (w.user?.name || "").toLowerCase().includes(workerSearch.toLowerCase()) ||
                        (w.skill || "").toLowerCase().includes(workerSearch.toLowerCase()) ||
                        (w.user?.email || "").toLowerCase().includes(workerSearch.toLowerCase())
                    )
                    .map((worker) => (
                      <tr key={worker.workerId}>
                        <td>
                          <strong>{worker.user?.name || "N/A"}</strong>
                        </td>
                        <td>{worker.user?.email}</td>
                        <td>
                          <span className="skill-chip">{worker.skill}</span>
                        </td>
                        <td>{worker.experience} yrs</td>
                        <td>{worker.location || `${worker.user?.city || ""}, ${worker.user?.state || ""}`}</td>
                        <td>⭐ {worker.rating || "5.0"}</td>
                        <td>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <button
                              className="table-btn actions-btn"
                              title="View All Worker Actions & Activity Log"
                              onClick={() => {
                                setSelectedWorkerActions(worker);
                                setIsWorkerActionsModalOpen(true);
                              }}
                              style={{
                                padding: "6px 12px",
                                background: "#0284c7",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "700",
                                fontSize: "12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              ⚡ Actions
                            </button>
                            <button
                              className="table-btn delete-btn"
                              onClick={() =>
                                handleDeleteClick(
                                  worker.user?.userId,
                                  "WORKER",
                                  worker.user?.name || "Worker"
                                )
                              }
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMERS */}
        {currentTab === "customers" && (
          <div className="tab-section fade-in">
            <div className="section-header-bar">
              <div>
                <h2>Registered Customers</h2>
                <p>All registered customers on the platform.</p>
              </div>
              <div className="header-right-actions">
                <input
                  type="text"
                  placeholder="🔍 Search customers..."
                  className="search-input"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                <button className="action-btn primary-btn" onClick={() => openCreateUserModal("CUSTOMER")}>
                  ➕ Add New Customer
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customersList
                    .filter(
                      (c) =>
                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        c.email.toLowerCase().includes(customerSearch.toLowerCase())
                    )
                    .map((customer) => (
                      <tr key={customer.userId}>
                        <td>
                          <strong>{customer.name}</strong>
                        </td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.city}, {customer.state}</td>
                        <td>
                          <button
                            className="table-btn delete-btn"
                            onClick={() =>
                              handleDeleteClick(customer.userId, "CUSTOMER", customer.name)
                            }
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BOOKINGS */}
        {currentTab === "bookings" && (
          <div className="tab-section fade-in">
            <div className="section-header-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2>All Platform Bookings</h2>
                <p>Monitor all customer requests and worker responses (Showing {filteredBookings.length} of {bookings.length}).</p>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="🔍 Search customer, worker, ID..."
                  className="search-input"
                  value={bookingSearchQuery}
                  onChange={(e) => setBookingSearchQuery(e.target.value)}
                  style={{ width: "220px" }}
                />

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    background: "white",
                    fontWeight: "600"
                  }}
                >
                  <option value="ALL">All Statuses ({bookings.length})</option>
                  <option value="ACCEPTED">Accepted ({acceptedCount})</option>
                  <option value="PENDING">Pending ({pendingCount})</option>
                  <option value="REJECTED">Rejected ({rejectedCount})</option>
                </select>

                <select
                  value={bookingSortOrder}
                  onChange={(e) => setBookingSortOrder(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    background: "white",
                    fontWeight: "600"
                  }}
                >
                  <option value="RECENTS">⏳ Most Recent First (Recents)</option>
                  <option value="OLDEST">📅 Oldest First</option>
                </select>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <p style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                No bookings match your selected filter criteria.
              </p>
            ) : (
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Worker</th>
                      <th>Job Description</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.bookingId}>
                        <td>#{b.bookingId}</td>
                        <td>{b.customer?.name || "Customer"}</td>
                        <td>{b.worker?.user?.name || "Worker"}</td>
                        <td>"{b.workDescription}"</td>
                        <td>{b.location || "N/A"}</td>
                        <td>
                          <span className={`status-pill ${b.status?.toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ADMINS */}
        {currentTab === "admins" && (
          <div className="tab-section fade-in">
            <div className="section-header-bar">
              <div>
                <h2>System Administrators Directory</h2>
                <p>Create and manage Admin accounts authorized to register workers on SkillLocal.</p>
              </div>
              <div className="header-right-actions">
                <button
                  className="action-btn primary-btn"
                  onClick={() => {
                    setAdminCreationDistricts([]);
                    setNewAdminData({
                      name: "",
                      email: "",
                      phone: "",
                      password: "",
                      city: "",
                      district: "",
                      state: "",
                      privateQuestion: "What city were you born in?",
                      securityAnswer: "SuperAdmin"
                    });
                    setIsCreateAdminModalOpen(true);
                  }}
                >
                  🔑 Add New Admin
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Admin Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Registered Workers</th>
                    <th>Total Users Managed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminsList.map((admin) => {
                    const stat = adminStats.find(
                      (s) => s.email?.toLowerCase() === admin.email?.toLowerCase()
                    );
                    return (
                      <tr key={admin.userId}>
                        <td>
                          <strong>{admin.name}</strong>
                        </td>
                        <td>{admin.email}</td>
                        <td>{admin.phone}</td>
                        <td>
                          {admin.city ? `${admin.city}, ${admin.state || ""}` : "System Admin"}
                        </td>
                        <td>
                          <span
                            className="skill-chip"
                            style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: "700" }}
                          >
                            👷 {stat ? stat.registeredWorkerCount : 0} Workers
                          </span>
                        </td>
                        <td>
                          <span
                            className="skill-chip"
                            style={{ background: "#fef3c7", color: "#b45309", fontWeight: "700" }}
                          >
                            👥 {stat ? stat.totalUsersCount : 0} Users
                          </span>
                        </td>
                        <td>
                          <button
                            className="table-btn delete-btn"
                            onClick={() =>
                              handleDeleteClick(admin.userId, "ADMIN", admin.name)
                            }
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CREATE ADMIN MODAL */}
      {isCreateAdminModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>🔑 Create New System Admin Account</h2>
              <button className="close-btn" onClick={() => setIsCreateAdminModalOpen(false)}>
                ✖
              </button>
            </div>
            <form onSubmit={handleCreateAdminSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Admin Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newAdminData.name}
                    onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                    placeholder="e.g. Chennai Regional Admin"
                  />
                </div>
                <div className="form-group">
                  <label>Admin Working Email *</label>
                  <input
                    type="email"
                    required
                    value={newAdminData.email}
                    onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                    placeholder="e.g. admin_chennai@gmail.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number (10 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength="10"
                    value={newAdminData.phone}
                    onChange={(e) => setNewAdminData({ ...newAdminData, phone: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    required
                    value={newAdminData.password}
                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                    placeholder="Enter admin password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State *</label>
                  <select required value={newAdminData.state} onChange={handleAdminCreationStateChange}>
                    <option value="">Select State</option>
                    {Object.keys(STATE_DISTRICTS).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>District *</label>
                  <select
                    required
                    value={newAdminData.district}
                    onChange={(e) => setNewAdminData({ ...newAdminData, district: e.target.value })}
                  >
                    <option value="">Select District</option>
                    {adminCreationDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    value={newAdminData.city}
                    onChange={(e) => setNewAdminData({ ...newAdminData, city: e.target.value })}
                    placeholder="City name"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="action-btn secondary-btn"
                  onClick={() => setIsCreateAdminModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn primary-btn">
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL (WORKER OR CUSTOMER) */}
      {isCreateUserModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Register New {createUserType === "WORKER" ? "Worker" : "Customer"}</h2>
              <button className="close-btn" onClick={() => setIsCreateUserModalOpen(false)}>
                ✖
              </button>
            </div>
            <form onSubmit={handleCreateUserSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="e.g. ramesh@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number (10 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength="10"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type={showNewUserPassword ? "text" : "password"}
                      required
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      placeholder="ex: Enter password"
                      style={{ width: "100%", paddingRight: "40px" }}
                      autoComplete="new-password"
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

              <div className="form-row">
                <div className="form-group">
                  <label>State *</label>
                  <select required value={newUserData.state} onChange={handleCreationStateChange}>
                    <option value="">Select State</option>
                    {Object.keys(STATE_DISTRICTS).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>District *</label>
                  <select
                    required
                    value={newUserData.district}
                    onChange={(e) => setNewUserData({ ...newUserData, district: e.target.value })}
                  >
                    <option value="">Select District</option>
                    {creationDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.city}
                    onChange={(e) => setNewUserData({ ...newUserData, city: e.target.value })}
                    placeholder="City name"
                  />
                </div>
              </div>

              {createUserType === "WORKER" && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Primary Skill *</label>
                    <select
                      value={newUserData.skill}
                      onChange={(e) => setNewUserData({ ...newUserData, skill: e.target.value })}
                    >
                      <option value="Plumber">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Painter">Painter</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="AC Technician">AC Technician</option>
                      <option value="General Worker">General Worker</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Years of Experience *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newUserData.experience}
                      onChange={(e) => setNewUserData({ ...newUserData, experience: e.target.value })}
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="action-btn secondary-btn"
                  onClick={() => setIsCreateUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn primary-btn">
                  Create {createUserType === "WORKER" ? "Worker" : "Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* WORKER ACTIONS & ACTIVITY LOG MODAL */}
      {isWorkerActionsModalOpen && selectedWorkerActions && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "800px", width: "90%" }}>
            <div className="modal-header">
              <h2>⚡ Worker Actions & Activity Log - {selectedWorkerActions.user?.name || "Worker"}</h2>
              <button className="close-btn" onClick={() => setIsWorkerActionsModalOpen(false)}>
                ✖
              </button>
            </div>
            
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", maxHeight: "70vh", overflowY: "auto" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div>
                  <small style={{ color: "#64748b", display: "block" }}>Trade / Skill</small>
                  <strong style={{ color: "#2563eb" }}>{selectedWorkerActions.skill}</strong>
                </div>
                <div>
                  <small style={{ color: "#64748b", display: "block" }}>Experience</small>
                  <strong>{selectedWorkerActions.experience} Years</strong>
                </div>
                <div>
                  <small style={{ color: "#64748b", display: "block" }}>Rating</small>
                  <strong style={{ color: "#f59e0b" }}>⭐ {selectedWorkerActions.rating ? selectedWorkerActions.rating.toFixed(1) : "5.0"}</strong>
                </div>
                <div>
                  <small style={{ color: "#64748b", display: "block" }}>Availability</small>
                  <span className={`status-pill ${selectedWorkerActions.availability?.toLowerCase()}`}>
                    {selectedWorkerActions.availability}
                  </span>
                </div>
              </div>

              {(() => {
                const wBookings = bookings.filter(b => b.worker?.workerId === selectedWorkerActions.workerId);
                const wAccepted = wBookings.filter(b => b.status === "ACCEPTED").length;
                const wPending = wBookings.filter(b => b.status === "PENDING").length;
                const wRejected = wBookings.filter(b => b.status === "REJECTED").length;
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "18px", fontWeight: "800", color: "#16a34a" }}>{wAccepted}</span>
                      <p style={{ margin: 0, fontSize: "11px", color: "#15803d" }}>Accepted</p>
                    </div>
                    <div style={{ background: "#fffbebe1", border: "1px solid #fde68a", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "18px", fontWeight: "800", color: "#d97706" }}>{wPending}</span>
                      <p style={{ margin: 0, fontSize: "11px", color: "#b45309" }}>Pending</p>
                    </div>
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "18px", fontWeight: "800", color: "#dc2626" }}>{wRejected}</span>
                      <p style={{ margin: 0, fontSize: "11px", color: "#b91c1c" }}>Rejected</p>
                    </div>
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "18px", fontWeight: "800", color: "#2563eb" }}>{wBookings.length}</span>
                      <p style={{ margin: 0, fontSize: "11px", color: "#1d4ed8" }}>Total Jobs</p>
                    </div>
                  </div>
                );
              })()}

              <div>
                <h4 style={{ margin: "0 0 10px", color: "#1e293b" }}>📜 Actions & Booking Timeline</h4>
                {(() => {
                  const wBookings = bookings.filter(b => b.worker?.workerId === selectedWorkerActions.workerId);
                  if (wBookings.length === 0) {
                    return (
                      <p style={{ padding: "16px", textAlign: "center", background: "#f8fafc", borderRadius: "8px", color: "#64748b" }}>
                        No action logs found for this worker.
                      </p>
                    );
                  }
                  return (
                    <div className="table-wrapper" style={{ maxHeight: "280px", overflowY: "auto" }}>
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Action Event</th>
                            <th>Customer</th>
                            <th>Description</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wBookings.map((b) => (
                            <tr key={b.bookingId}>
                              <td>{b.bookingDate}</td>
                              <td>
                                <strong style={{ color: b.status === "ACCEPTED" ? "#16a34a" : b.status === "REJECTED" ? "#dc2626" : "#d97706" }}>
                                  {b.status === "ACCEPTED" ? "✅ Accepted Job" : b.status === "REJECTED" ? "❌ Rejected Job" : "⏳ Pending Response"}
                                </strong>
                              </td>
                              <td>{b.customer?.name || "N/A"}</td>
                              <td>{b.workDescription}</td>
                              <td>
                                <span className={`status-pill ${b.status?.toLowerCase()}`}>
                                  {b.status}
                                </span>
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

            <div className="modal-actions" style={{ marginTop: "10px" }}>
              <button className="action-btn secondary-btn" onClick={() => setIsWorkerActionsModalOpen(false)}>
                Close Actions Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
