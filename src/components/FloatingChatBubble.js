import React from "react";

const FloatingChatBubble = ({ onClick, isOpen }) => {
  return (
    <button
      aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      onClick={onClick}
      style={{
        position: "fixed",
        left: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "none",
        background: "linear-gradient(135deg, #00ff88, #00bfa5)",
        boxShadow: "0 8px 18px rgba(0, 0, 0, 0.35)",
        color: "#000",
        fontSize: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 2000,
        outline: "none"
      }}
    >
      {isOpen ? "✕" : "💬"}
    </button>
  );
};

export default FloatingChatBubble;
