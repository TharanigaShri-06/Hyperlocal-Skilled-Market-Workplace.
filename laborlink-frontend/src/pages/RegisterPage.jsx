import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { registerUser } from "../services/userService";
import Toast from "../components/Toast";
import "../styles/RegisterPage.css";

import { STATE_DISTRICTS } from "../services/locationData";

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    district: "",
    state: "",
    role: "CUSTOMER",
    privateQuestion: "",
    securityAnswer: ""
  });

  const [districts, setDistricts] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({
        ...prev,
        email: location.state.email || "",
        password: "" // Force manual entry: do not pre-fill password from redirect state
      }));
      if (location.state.autoToastMessage) {
        showToast(location.state.autoToastMessage, "info");
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // If state changes, load matching districts
      if (name === "state") {
        const list = STATE_DISTRICTS[value] || [];
        setDistricts(list);
        updated.district = list[0] || ""; // Select first district by default
      }
      return updated;
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email) || formData.email.endsWith('.cm')) {
      showToast("Please enter a valid email address (invalid format).", "warning");
      return;
    }

    if (!formData.state || !formData.district) {
      showToast("Please select both a State and District.", "warning");
      return;
    }

    try {
      const userPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        role: formData.role,
        privateQuestion: formData.privateQuestion,
        securityAnswer: formData.securityAnswer
      };

      const savedUser = await registerUser(userPayload);

      // Auto-login: Store direct user login state immediately
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(savedUser)
      );
      localStorage.removeItem("registeredUser"); // Clear any signup intermediate keys

      showToast("Registration Successful! Redirecting you to your account...", "success");

      setTimeout(() => {
        if (formData.role === "WORKER") {
          navigate("/worker-profile");
        } else {
          navigate("/customer");
        }
      }, 1500);
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message || "Registration Failed",
        "error"
      );
    }
  };

  return (
    <div className="register-page">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      <div className="register-content-wrapper">
        
        {/* LEFT COLUMN: BRAND INFO */}
        <div className="register-left-info">
          <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <div className="logo-icon">📍</div>
            <div className="logo-text">
              <span>Skill</span>Local
              <small>Local Jobs. Skilled People. Stronger Communities.</small>
            </div>
          </div>

          <div className="info-main-content">
            <h1 className="main-title">
              Create Account.<br />
              Get Discovered.<br />
              Grow <span>Locally.</span>
            </h1>

            <p className="main-desc">
              Join thousands of skilled professionals and customers building their local community together.
            </p>

            <div className="register-hero-image-box" style={{ margin: "25px 0", textAlign: "center" }}>
              <svg viewBox="0 0 500 400" width="100%" height="auto" style={{ maxHeight: "250px" }}>
                <defs>
                  <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(26, 68, 108, 0.12)" />
                    <stop offset="100%" stopColor="rgba(245, 158, 11, 0.12)" />
                  </linearGradient>
                  <linearGradient id="pinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="houseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1a446c" />
                    <stop offset="100%" stopColor="#0f2b46" />
                  </linearGradient>
                </defs>
                
                <circle cx="250" cy="200" r="150" fill="url(#circleGrad)" />
                <circle cx="250" cy="200" r="110" fill="none" stroke="rgba(26, 68, 108, 0.08)" strokeWidth="2" strokeDasharray="5,5" />
                
                <g style={{ transform: 'translateY(-10px)', animation: 'floatHouse 4s ease-in-out infinite alternate' }}>
                  <path d="M190 260 L190 190 L250 140 L310 190 L310 260 Z" fill="url(#houseGrad)" opacity="0.95" />
                  <path d="M175 190 L250 120 L325 190" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="230" y="210" width="40" height="50" rx="4" fill="#f8fafc" />
                </g>
                
                <g style={{ transform: 'translateY(10px)', animation: 'floatPin 3s ease-in-out infinite alternate' }}>
                  <path d="M250 85 C215 85 185 115 185 150 C185 195 250 270 250 270 C250 270 315 195 315 150 C315 115 285 85 250 85 Z" fill="url(#pinGrad)" />
                  <circle cx="250" cy="140" r="20" fill="white" />
                  <path d="M245 130 L245 145 L255 145" fill="none" stroke="#0f2b46" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                <g style={{ animation: 'floatTool1 5s ease-in-out infinite alternate' }}>
                  <circle cx="110" cy="150" r="22" fill="white" filter="drop-shadow(0 4px 8px rgba(15,43,70,0.08))" />
                  <text x="110" y="157" fontSize="22" textAnchor="middle">🔧</text>
                </g>
                
                <g style={{ animation: 'floatTool2 4.5s ease-in-out infinite alternate' }}>
                  <circle cx="390" cy="160" r="22" fill="white" filter="drop-shadow(0 4px 8px rgba(15,43,70,0.08))" />
                  <text x="390" y="167" fontSize="22" textAnchor="middle">🖌️</text>
                </g>
                
                <g style={{ animation: 'floatTool3 6s ease-in-out infinite alternate' }}>
                  <circle cx="140" cy="270" r="22" fill="white" filter="drop-shadow(0 4px 8px rgba(15,43,70,0.08))" />
                  <text x="140" y="277" fontSize="22" textAnchor="middle">💡</text>
                </g>
                
                <g style={{ animation: 'floatTool4 5.5s ease-in-out infinite alternate' }}>
                  <circle cx="350" cy="270" r="22" fill="white" filter="drop-shadow(0 4px 8px rgba(15,43,70,0.08))" />
                  <text x="350" y="277" fontSize="22" textAnchor="middle">👷</text>
                </g>
                
                <style>{`
                  @keyframes floatHouse {
                    0% { transform: translateY(-8px); }
                    100% { transform: translateY(4px); }
                  }
                  @keyframes floatPin {
                    0% { transform: translateY(8px); }
                    100% { transform: translateY(-4px); }
                  }
                  @keyframes floatTool1 {
                    0% { transform: translateY(0px) rotate(0deg); }
                    100% { transform: translateY(-10px) rotate(8deg); }
                  }
                  @keyframes floatTool2 {
                    0% { transform: translateY(0px) rotate(0deg); }
                    100% { transform: translateY(10px) rotate(-12deg); }
                  }
                  @keyframes floatTool3 {
                    0% { transform: translateY(0px); }
                    100% { transform: translateY(-8px); }
                  }
                  @keyframes floatTool4 {
                    0% { transform: translateY(0px); }
                    100% { transform: translateY(6px); }
                  }
                `}</style>
              </svg>
            </div>

            <div className="highlights-grid">
              <div className="highlight-item">
                <span className="highlight-icon">📍</span>
                <div>
                  <strong>Local Jobs</strong>
                  <p>Near You</p>
                </div>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">👤</span>
                <div>
                  <strong>Verified</strong>
                  <p>Profiles</p>
                </div>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🛡️</span>
                <div>
                  <strong>Safe &</strong>
                  <p>Reliable</p>
                </div>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">💳</span>
                <div>
                  <strong>Better</strong>
                  <p>Earnings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="worker-banner-quote">
            <div className="quote-icon">“</div>
            <p className="quote-txt">
              Whether you're looking to hire or find work, SkillLocal connects you to the right people, <span>right here.</span>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: SIGNUP CARD */}
        <div className="register-right-card">
          <div className="signup-card">
            <h2>Create Your Account</h2>
            <p className="signup-subtitle">Fill in the details below to get started.</p>

            <form onSubmit={handleRegister} className="signup-form">
              {/* Dummy fields to capture and prevent browser auto-fill */}
              <input type="text" name="prevent_autofill_email" style={{ position: "absolute", top: "-9999px", left: "-9999px", opacity: 0 }} tabIndex="-1" />
              <input type="password" name="prevent_autofill_password" style={{ position: "absolute", top: "-9999px", left: "-9999px", opacity: 0 }} tabIndex="-1" />

              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    name="name"
                    type="text"
                    placeholder="ex: Ramesh Kumar"
                    autoComplete="off"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉️</span>
                  <input
                    name="email"
                    type="email"
                    placeholder="ex: user@example.com"
                    autoComplete="off"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="ex: Enter password"
                    autoComplete="off"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "🔒" : "👁️"}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <span className="input-icon">📞</span>
                  <input
                    name="phone"
                    type="text"
                    placeholder="ex: 9876543210"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Role</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <select name="role" value={formData.role} onChange={handleChange} required>
                    <option value="CUSTOMER">Customer (Looking to hire)</option>
                    <option value="WORKER">Worker (Looking for work)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>City</label>
                <div className="input-with-icon">
                  <span className="input-icon">🏢</span>
                  <input
                    name="city"
                    type="text"
                    placeholder="ex: Coimbatore"
                    autoComplete="off"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row-select">
                <div className="form-group half-width">
                  <label>State</label>
                  <select name="state" value={formData.state} onChange={handleChange} required>
                    <option value="">Select state...</option>
                    {Object.keys(STATE_DISTRICTS).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group half-width">
                  <label>District</label>
                  <select name="district" value={formData.district} onChange={handleChange} required disabled={!formData.state}>
                    <option value="">Select district...</option>
                    {districts.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="security-question-panel">
                <h4>Security Verification</h4>
                <div style={{ marginBottom: "10px" }}>
                  <select
                    name="privateQuestion"
                    value={formData.privateQuestion}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose a security question...</option>
                    <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                    <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                    <option value="What city were you born in?">What city were you born in?</option>
                    <option value="What was the name of your high school?">What was the name of your high school?</option>
                  </select>
                </div>
                <div>
                  <input
                    name="securityAnswer"
                    placeholder="ex: Tommy"
                    autoComplete="off"
                    value={formData.securityAnswer}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="signup-submit-btn">
                Sign Up &nbsp; →
              </button>

              <p className="login-toggle-text">
                Already have an account? <Link to="/login">Login</Link>
              </p>

              <div className="safe-info-badge">
                🛡️ Your information is safe and secure with us.
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FOOTER STATS BANNER */}
      <div className="register-footer-banner">
        <div className="stats-banner-wrapper">
          <div className="banner-stat-box">
            <span className="stat-icon">👥</span>
            <div>
              <h3>10K+</h3>
              <p>Skilled Professionals</p>
            </div>
          </div>
          <div className="banner-stat-box">
            <span className="stat-icon">💼</span>
            <div>
              <h3>25K+</h3>
              <p>Jobs Completed</p>
            </div>
          </div>
          <div className="banner-stat-box">
            <span className="stat-icon">📍</span>
            <div>
              <h3>100+</h3>
              <p>Cities Covered</p>
            </div>
          </div>
          <div className="banner-stat-box">
            <span className="stat-icon">⭐</span>
            <div>
              <h3>4.8/5</h3>
              <p>User Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
