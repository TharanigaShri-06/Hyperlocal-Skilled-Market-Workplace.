import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import { loginUser, checkEmailExists, getSecurityQuestion, resetPassword } from "../services/userService";
import { getWorkerByUserId } from "../services/workerService";
import Toast from "../components/Toast";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state variables
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const navigate = useNavigate();

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      showToast("Please enter a valid email address (e.g. name@example.com).", "warning");
      return;
    }

    try {
      // Step 1: Check if email exists
      const exists = await checkEmailExists(cleanEmail);
      if (!exists) {
        showToast("This email is not registered yet. Redirecting to signup page...", "warning");
        setTimeout(() => {
          navigate("/register", { state: { email: cleanEmail, password } });
        }, 2000);
        return;
      }

      // Step 2: Attempt standard login
      const response = await loginUser({
        email: cleanEmail,
        password
      });

      const userObj = {
        ...response,
        email: response.email || cleanEmail
      };

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(userObj)
      );

      showToast(`Welcome back, ${response.name}!`, "success");

      setTimeout(() => {
        if (response.role === "CUSTOMER") {
          navigate("/customer");
        } else if (response.role === "WORKER") {
          try {
            getWorkerByUserId(response.userId).then((profile) => {
              if (profile && profile.skill) {
                navigate("/worker");
              } else {
                localStorage.setItem("registeredUser", JSON.stringify({ userId: response.userId }));
                navigate("/worker-profile");
              }
            }).catch(() => {
              localStorage.setItem("registeredUser", JSON.stringify({ userId: response.userId }));
              navigate("/worker-profile");
            });
          } catch (err) {
            localStorage.setItem("registeredUser", JSON.stringify({ userId: response.userId }));
            navigate("/worker-profile");
          }
        } else if (response.role === "SUPERADMIN") {
          navigate("/superadmin");
        } else if (response.role === "ADMIN") {
          navigate("/admin");
        }
      }, 1000);
    } catch (error) {
      showToast(error?.response?.data?.message || "Invalid Email or Password", "error");
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (forgotStep === 1) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(forgotEmail)) {
        showToast("Please enter a valid email address (e.g. name@example.com).", "warning");
        return;
      }
      try {
        const res = await getSecurityQuestion(forgotEmail);
        if (res.exists === "true") {
          setSecurityQuestion(res.question);
          setForgotStep(2);
        } else {
          showToast("Email not found in our records.", "error");
        }
      } catch (err) {
        showToast("Error looking up email.", "error");
      }
    } else {
      if (newPassword !== confirmPassword) {
        showToast("Passwords do not match.", "warning");
        return;
      }
      try {
        await resetPassword({
          email: forgotEmail,
          securityAnswer,
          newPassword
        });
        showToast("Password reset successful! You can now log in.", "success");
        setTimeout(() => {
          setIsForgotPassword(false);
          setForgotStep(1);
          setEmail(forgotEmail);
          setForgotEmail("");
          setSecurityAnswer("");
          setNewPassword("");
          setConfirmPassword("");
        }, 2000);
      } catch (err) {
        showToast(err?.response?.data?.message || "Verification failed. Please check your answer.", "error");
      }
    }
  };

  return (
    <div className="login-page">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      {/* LEFT SECTION */}
      <div className="login-left-side">
        <div className="login-logo-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="logo-pin">📍</div>
          <div className="logo-txt">
            <span>Skill</span>Local
          </div>
        </div>

        {!isForgotPassword ? (
          <div className="login-content-box">
            <h1 className="welcome-title">Welcome Back!</h1>
            <p className="welcome-text">
              Login to your account and continue your journey with <span>skilled professionals</span>.
            </p>

            <form onSubmit={handleLogin} className="login-form">
              {/* Dummy fields to capture and prevent browser auto-fill */}
              <input type="text" name="prevent_autofill_email" style={{ position: "absolute", top: "-9999px", left: "-9999px", opacity: 0 }} tabIndex="-1" />
              <input type="password" name="prevent_autofill_password" style={{ position: "absolute", top: "-9999px", left: "-9999px", opacity: 0 }} tabIndex="-1" />

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    placeholder="ex: user@example.com"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="ex: Enter password"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "🔒" : "👁️"}
                  </span>
                </div>
              </div>

              <div className="remember-row">
                <label className="checkbox-container">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <span
                  className="forgot"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setForgotStep(1);
                    setForgotEmail("");
                    setSecurityAnswer("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Forgot Password?
                </span>
              </div>

              <button type="submit" className="login-submit-btn">
                Login
              </button>

              <p className="signup-toggle-text">
                Don't have an account? <Link to="/register">Sign Up</Link>
              </p>
            </form>
          </div>
        ) : (
          <div className="login-content-box">
            <h1 className="welcome-title">Reset Password</h1>
            <p className="welcome-text">
              {forgotStep === 1
                ? "Enter your registered email to retrieve your private question."
                : "Answer the private question below to verify your identity and set a new password."}
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="login-form" autoComplete="off">
              {/* Dummy fields to capture and prevent browser auto-fill */}
              <input type="text" name="prevent_autofill_email_forgot" style={{ position: "absolute", top: "-9999px", left: "-9999px", opacity: 0 }} tabIndex="-1" />
              <input type="password" name="prevent_autofill_password_forgot" style={{ position: "absolute", top: "-9999px", left: "-9999px", opacity: 0 }} tabIndex="-1" />

              {forgotStep === 1 ? (
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      name="forgot_email_address_field"
                      placeholder="ex: name@example.com"
                      autoComplete="new-password"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Security Question</label>
                    <input
                      type="text"
                      className="form-input-disabled"
                      value={securityQuestion || "Private Question"}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Your Answer</label>
                    <div className="input-with-icon">
                      <span className="input-icon">❓</span>
                      <input
                        type="text"
                        name="security_answer_forgot_field"
                        placeholder="ex: Tommy"
                        autoComplete="new-password"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="input-with-icon">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="new_password_forgot_field"
                        placeholder="ex: NewPassword@123"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <span className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? "🔒" : "👁️"}
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-with-icon">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password_forgot_field"
                        placeholder="ex: NewPassword@123"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? "🔒" : "👁️"}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="login-submit-btn">
                {forgotStep === 1 ? "Next Step" : "Reset Password"}
              </button>

              <p className="signup-toggle-text">
                Remembered your password?{" "}
                <span
                  className="back-link"
                  onClick={() => setIsForgotPassword(false)}
                >
                  Back to Login
                </span>
              </p>
            </form>
          </div>
        )}

        <div className="login-footer-info">
          <div className="footer-logo-pin">📍</div>
          <div className="footer-logo-text">
            Local Skills. <span>Stronger Communities.</span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - MOSAIC IMAGE */}
      <div className="login-right-side">
        <img
          src="/loginpage.png.png"
          alt="SkillLocal Workers Mosaic"
          className="login-mosaic-image"
        />
      </div>
    </div>
  );
}

export default LoginPage;