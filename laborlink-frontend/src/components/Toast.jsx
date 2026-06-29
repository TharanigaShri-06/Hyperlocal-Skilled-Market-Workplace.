import React, { useEffect } from "react";
import "../styles/Toast.css";

function Toast({ message, type = "info", onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`in-app-toast toast-${type}`}>
      <span className="toast-icon">
        {type === "success" && "✅"}
        {type === "error" && "❌"}
        {type === "warning" && "⚠️"}
        {type === "info" && "ℹ️"}
      </span>
      <p className="toast-message">{message}</p>
      <button className="toast-close-btn" onClick={onClose}>×</button>
    </div>
  );
}

export default Toast;
