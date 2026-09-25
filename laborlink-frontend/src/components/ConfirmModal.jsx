import React from "react";
import "../styles/ConfirmModal.css";

function ConfirmModal({ isOpen = true, title = "Confirm Action", message, onConfirm, onCancel }) {
  if (isOpen === false) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-box">
        <div className="confirm-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-ok-btn" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
