import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllWorkers } from "../services/workerService";
import { createBooking, getBookingsByCustomer, rateBooking } from "../services/bookingService";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "../styles/CustomerDashboard.css";

const SKILL_ICONS = {
  "Plumber": "🔧",
  "Electrician": "⚡",
  "Painter": "🎨",
  "Carpenter": "🛠️",
  "AC Technician": "❄️",
  "General Worker": "💼"
};

function CustomerDashboard() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Sidebar Navigation State: "browse" or "bookings"
  const [currentTab, setCurrentTab] = useState("browse");

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  // Filters State
  const [searchText, setSearchText] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  
  // Booking History Filters
  const [historyStatusFilter, setHistoryStatusFilter] = useState("ALL");
  const [historySortBy, setHistorySortBy] = useState("date-desc");

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    loadWorkers();
    if (loggedInUser) {
      loadBookings();
    }
  }, []);

  const loadWorkers = async () => {
    try {
      const data = await getAllWorkers();
      setWorkers(data);
    } catch (error) {
      console.error("Error loading workers:", error);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await getBookingsByCustomer(loggedInUser.userId);
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const openBookingModal = (worker) => {
    setSelectedWorker(worker);
    setJobDescription("");
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!jobDescription.trim()) {
      showToast("Please provide a job description.", "warning");
      return;
    }

    try {
      const bookingData = {
        workDescription: jobDescription,
        location: selectedWorker.location || `${selectedWorker.user?.city || ""}, ${selectedWorker.user?.state || ""}`,
        bookingDate: new Date().toISOString().split("T")[0],
        status: "PENDING",
        customer: {
          userId: loggedInUser.userId
        },
        worker: {
          workerId: selectedWorker.workerId
        }
      };

      await createBooking(bookingData);
      showToast("Booking Proposal Created Successfully! The worker has been notified.", "success");
      setIsModalOpen(false);
      
      // Reload and automatically switch to Bookings History tab
      await loadBookings();
      setCurrentTab("bookings");
    } catch (error) {
      console.error("Booking error:", error);
      showToast("Booking Failed", "error");
    }
  };

  // Extract unique cities & states for filter options
  const uniqueCities = [...new Set(workers.map(w => w.user?.city).filter(Boolean))];
  const uniqueStates = [...new Set(workers.map(w => w.user?.state).filter(Boolean))];
  const uniqueCategories = [...new Set(workers.map(w => w.skill).filter(Boolean))];

  // Filtering worker list
  const filteredWorkers = workers.filter((w) => {
    const nameMatches = (w.user?.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
                        (w.skill || "").toLowerCase().includes(searchText.toLowerCase());
    const cityMatches = cityFilter === "ALL" || w.user?.city === cityFilter;
    const stateMatches = stateFilter === "ALL" || w.user?.state === stateFilter;
    const catMatches = categoryFilter === "ALL" || w.skill === categoryFilter;

    return nameMatches && cityMatches && stateMatches && catMatches;
  });

  // Filter & Sort Bookings History
  const filteredAndSortedBookings = bookings
    .filter((b) => {
      if (historyStatusFilter === "ALL") return true;
      return b.status === historyStatusFilter;
    })
    .sort((a, b) => {
      if (historySortBy === "date-desc") {
        return new Date(b.bookingDate) - new Date(a.bookingDate);
      }
      if (historySortBy === "date-asc") {
        return new Date(a.bookingDate) - new Date(b.bookingDate);
      }
      if (historySortBy === "worker-name") {
        const nameA = a.worker?.user?.name || "";
        const nameB = b.worker?.user?.name || "";
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="customer-dashboard-layout">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      {/* SIDEBAR PANEL */}
      <div className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="logo-pin">📍</div>
          <div className="brand-info">
            <h2>SkillLocal</h2>
            <small>Hyperlocal. Skilled. Trusted.</small>
          </div>
        </div>

        <ul className="sidebar-nav">
          <li className={currentTab === "browse" ? "active" : ""} onClick={() => setCurrentTab("browse")}>
            <span className="nav-icon">🔍</span> Browse Workers
          </li>
          <li className={currentTab === "bookings" ? "active" : ""} onClick={() => setCurrentTab("bookings")}>
            <span className="nav-icon">📅</span> Bookings History ({bookings.length})
          </li>
        </ul>



        <div className="sidebar-footer-profile">
          <div className="profile-avatar">👤</div>
          <div className="profile-meta">
            <strong>{loggedInUser?.name || "Customer"}</strong>
            <p>Customer Account</p>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER CONTENT */}
      <div className="dashboard-main-content">
        {/* Main Content Header */}
        <div className="content-header">
          <div className="header-greeting">
            <h1>Welcome back, {loggedInUser?.name || "User"}! 👋</h1>
            <p>Find trusted skilled workers near you.</p>
          </div>
          
          <div className="quick-metrics-row">
            <div className="metric-badge">
              <span className="badge-icon">👥</span>
              <div>
                <p>Total Workers</p>
                <strong>{workers.length}</strong>
              </div>
            </div>
            <div className="metric-badge">
              <span className="badge-icon">✅</span>
              <div>
                <p>Verified Profiles</p>
                <strong>{workers.filter(w => w.availability === "AVAILABLE").length}</strong>
              </div>
            </div>
            <div className="metric-badge">
              <span className="badge-icon">📍</span>
              <div>
                <p>Cities Covered</p>
                <strong>{uniqueCities.length}</strong>
              </div>
            </div>
            <div className="metric-badge">
              <span className="badge-icon">💼</span>
              <div>
                <p>Jobs Booked</p>
                <strong>{bookings.length}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: BROWSE WORKERS */}
        {currentTab === "browse" && (
          <div className="browse-section-wrapper">
            
            {/* Filter controls panel */}
            <div className="filters-control-bar">
              <div className="search-field-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by skill or name..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <div className="filter-dropdown-select">
                <label>City</label>
                <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                  <option value="ALL">All Cities</option>
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="filter-dropdown-select">
                <label>State</label>
                <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                  <option value="ALL">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="filter-dropdown-select">
                <label>Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="ALL">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Workers Directory List Table */}
            <div className="workers-list-wrapper">
              <div className="list-title-row">
                <h2>All Workers ({filteredWorkers.length})</h2>
              </div>

              {filteredWorkers.length === 0 ? (
                <div className="empty-results-box">
                  No workers found matching your selected filters. Try adjusting your search query!
                </div>
              ) : (
                <div className="premium-table-container">
                  <table className="workers-table">
                    <thead>
                      <tr>
                        <th>Worker</th>
                        <th>Skill</th>
                        <th>Location</th>
                        <th>Experience</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.map((worker) => (
                        <tr key={worker.workerId}>
                          
                          {/* WORKER DETAILS */}
                          <td>
                            <div className="worker-profile-cell">
                              <div className="worker-photo">👤</div>
                              <div>
                                <strong className="worker-name-tag">{worker.user?.name || "Anonymous User"}</strong>
                                <p className="worker-id-tag">ID: SKL-{10000 + worker.workerId}</p>
                                <p className="worker-phone-tag">📞 {worker.user?.phone || "N/A"}</p>
                              </div>
                            </div>
                          </td>

                          {/* SKILL CATEGORY */}
                          <td>
                            <div className="worker-skill-badge">
                              <span className="skill-icon">
                                {SKILL_ICONS[worker.skill] || "💼"}
                              </span>
                              {worker.skill || "General Support"}
                            </div>
                          </td>

                          {/* LOCATION */}
                          <td>
                            <div className="worker-location-text">
                              {worker.user?.city || worker.location || "N/A"}, {worker.user?.state || "N/A"}
                              {worker.user?.district && <p className="district-label">{worker.user.district} District</p>}
                            </div>
                          </td>

                          {/* EXPERIENCE */}
                          <td>
                            <span className="worker-experience-label">
                              {worker.experience || 0}+ Years
                            </span>
                          </td>

                          {/* RATING */}
                          <td>
                            <div className="worker-rating-cell">
                              <span className="star-icon">⭐</span>
                              <strong>{worker.rating ? worker.rating.toFixed(1) : "5.0"}</strong>
                              <span className="review-count">(10+ reviews)</span>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={`status-indicator ${
                                worker.availability === "AVAILABLE" ? "available" : "busy"
                              }`}
                            >
                              {worker.availability || "AVAILABLE"}
                            </span>
                          </td>

                          {/* ACTION BUTTON */}
                          <td>
                            <div className="action-cell-buttons">
                              <button
                                onClick={() => openBookingModal(worker)}
                                disabled={worker.availability !== "AVAILABLE"}
                                className="action-book-btn"
                              >
                                {worker.availability === "AVAILABLE" ? "Book Now" : "Unavailable"}
                              </button>
                              <button className="heart-favorite-btn" title="Add to Favorites">
                                ❤️
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
          </div>
        )}

        {/* TAB 2: BOOKING HISTORY */}
        {currentTab === "bookings" && (
          <div className="bookings-section-wrapper">
            
            {/* Filter and Sort bar */}
            <div className="bookings-filter-bar">
              <div className="filter-button-group">
                <span className="group-label">Status Filter:</span>
                {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setHistoryStatusFilter(st)}
                    className={`filter-tab-btn ${historyStatusFilter === st ? "active" : ""}`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="sort-group-box">
                <label>Sort By</label>
                <select
                  value={historySortBy}
                  onChange={(e) => setHistorySortBy(e.target.value)}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="worker-name">Worker Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* List of bookings */}
            <div className="bookings-cards-list">
              {filteredAndSortedBookings.length === 0 ? (
                <div className="empty-results-box">
                  No bookings found under the selected filters.
                </div>
              ) : (
                filteredAndSortedBookings.map((booking) => (
                  <div key={booking.bookingId} className="booking-log-card">
                    
                    <div className="booking-card-header">
                      <div>
                        <h3>👤 {booking.worker?.user?.name || "Professional"}</h3>
                        <p className="skill-sub">💼 {booking.worker?.skill || "General Service"}</p>
                      </div>
                      <span
                        className={`status-badge-tag ${
                          booking.status === "ACCEPTED"
                            ? "accepted"
                            : booking.status === "REJECTED"
                            ? "rejected"
                            : "pending"
                        }`}
                      >
                        {booking.status || "PENDING"}
                      </span>
                    </div>

                    <div className="booking-card-body">
                      <div className="body-data-row">
                        <strong>Requested Job Description</strong>
                        <p>{booking.workDescription || "General Service Proposal"}</p>
                      </div>
                      <div className="body-data-row">
                        <strong>Booking Date</strong>
                        <p>📅 {booking.bookingDate || "N/A"}</p>
                      </div>
                      <div className="body-data-row">
                        <strong>Service Location</strong>
                        <p>📍 {booking.location || "N/A"}</p>
                      </div>

                      {booking.status === "ACCEPTED" && (
                        <div className="body-data-row rating-row" style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px dashed var(--border)" }}>
                          <strong>Worker Rating</strong>
                          {booking.rating && booking.rating > 0 ? (
                            <div className="rating-display-status">
                              <span style={{ color: "var(--accent)", fontSize: "16px" }}>
                                {"★".repeat(Math.floor(booking.rating))}
                                {booking.rating % 1 !== 0 ? "½" : ""}
                              </span>
                              <strong style={{ marginLeft: "5px" }}>({booking.rating.toFixed(1)})</strong>
                            </div>
                          ) : (
                            <div className="rating-input-action">
                              <select
                                defaultValue=""
                                onChange={async (e) => {
                                  const val = parseFloat(e.target.value);
                                  if (val) {
                                    try {
                                      await rateBooking(booking.bookingId, val);
                                      showToast("Thank you! Rating submitted successfully.", "success");
                                      loadBookings();
                                      loadWorkers();
                                    } catch (err) {
                                      console.error(err);
                                      showToast("Failed to submit rating.", "error");
                                    }
                                  }
                                }}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid var(--border)",
                                  background: "var(--bg)",
                                  fontSize: "14px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  color: "var(--text-h)"
                                }}
                              >
                                <option value="" disabled>Rate this worker...</option>
                                <option value="5.0">⭐⭐⭐⭐⭐ (5.0 Excellent)</option>
                                <option value="4.5">⭐⭐⭐⭐½ (4.5 Very Good)</option>
                                <option value="4.0">⭐⭐⭐⭐☆ (4.0 Good)</option>
                                <option value="3.0">⭐⭐⭐☆☆ (3.0 Average)</option>
                                <option value="2.0">⭐⭐☆☆☆ (2.0 Poor)</option>
                                <option value="1.0">⭐☆☆☆☆ (1.0 Very Poor)</option>
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </div>

      {/* BOOKING PROPOSAL MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-row">
              <h3>Book Skilled Professional</h3>
              <button className="close-modal-x" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-worker-summary">
              <div className="avatar-placeholder">👤</div>
              <div>
                <strong>{selectedWorker?.user?.name}</strong>
                <p>🔧 Trade: {selectedWorker?.skill}</p>
                <p>📍 Area: {selectedWorker?.user?.city}, {selectedWorker?.user?.state}</p>
                <p style={{ marginTop: "4px", fontSize: "14px", fontWeight: "600", color: "var(--primary)" }}>📞 Phone: {selectedWorker?.user?.phone || "N/A"}</p>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="modal-form">
              <div className="modal-form-group">
                <label>Job Description / Specific Problem to Fix</label>
                <textarea
                  placeholder="Describe your request in detail (e.g. Toilet flush tank leaking, living room wall painting, wooden table leg repair)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                  rows="5"
                />
              </div>

              <div className="modal-action-buttons">
                <button type="button" onClick={() => setIsModalOpen(false)} className="modal-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  Send Booking Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
