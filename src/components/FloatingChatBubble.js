import React from "react";
import { motion } from "framer-motion";
import { floatingBubbleVariants } from "../utils/motion-variants";

/**
 * 🎯 FloatingChatBubble - Burbuja flotante profesional de chat
 * - Animación de entrada suave
 * - Efecto hover mejorado
 * - Pulse indicador cuando hay mensajes nuevos
 */
const FloatingChatBubble = ({ onClick, isOpen }) => {
  return (
    <motion.button
      aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      onClick={onClick}
      variants={floatingBubbleVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      style={{
        position: "fixed",
        left: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "none",
        background: isOpen
          ? "linear-gradient(135deg, #ff6b6b, #ff8e53)"
          : "linear-gradient(135deg, #00ff88, #00bfa5)",
        boxShadow: "0 8px 18px rgba(0, 0, 0, 0.35)",
        color: "#000",
        fontSize: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 2000,
        outline: "none",
        fontWeight: 600,
        transition: "background 0.3s ease",
        position: "fixed",
        left: 16,
        bottom: 16,
        zIndex: 2000
      }}
    >
      <motion.span
        key={isOpen ? "close" : "chat"}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 180, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? "✕" : "💬"}
      </motion.span>

      {/* Indicador de pulso cuando no está abierto */}
      {!isOpen && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid #00ff88",
            opacity: 0
          }}
          animate={{
            scale: [1, 1.4],
            opacity: [0.8, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
    </motion.button>
  );
};

export default FloatingChatBubble;
