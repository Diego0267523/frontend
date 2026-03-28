import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_URL from "../utils/config";
import { useSocket } from "../context/SocketContext";
import DirectMessages from "./DirectMessages";
import {
  chatBubbleVariants,
  slideInDownVariants,
} from "../utils/motion-variants";

/**
 * 🎯 UnifiedChat - Panel unificado para chat de IA y mensajes directos
 * Características:
 * - Pestañas para alternar entre IA y mensajes directos
 * - Un solo panel flotante (sin doble fondo)
 * - Animaciones suaves entre modos
 */
function UnifiedChat({ onClose }) {
  const [activeTab, setActiveTab] = useState("ai"); // "ai" o "messages"
  const [aiMessages, setAiMessages] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("chat")) || [];
    return saved.slice(-10);
  });
  const [aiInput, setAiInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("chatTheme") !== "light";
  });

  const token = localStorage.getItem("token");
  const chatRef = useRef(null);
  // const { socket, connected } = useSocket(); // No usado por ahora

  // 🔥 AUTO SCROLL AL FINAL PARA CHAT IA
  useEffect(() => {
    if (activeTab === "ai") {
      chatRef.current?.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [aiMessages, activeTab]);

  // 🔥 LIMPIAR CHAT IA
  const clearAiChat = () => {
    setAiMessages([]);
    localStorage.removeItem("chat");
  };

  // 🔥 CAMBIAR TEMA
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("chatTheme", newTheme ? "dark" : "light");
  };

  // 🔥 ENVIAR MENSAJE A IA
  const sendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || !token) return;

    const userMessage = { role: "user", content: aiInput.trim() };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pregunta: userMessage.content })
      });

      if (!res.ok) throw new Error("Error en la respuesta");

      const data = await res.json();
      const aiMessage = { role: "assistant", content: data.respuesta };

      setAiMessages(prev => {
        const limited = [...prev, aiMessage].slice(-10);
        localStorage.setItem("chat", JSON.stringify(limited));
        return limited;
      });
    } catch (error) {
      console.error("❌ Error en chat IA:", error);
      const errorMessage = {
        role: "assistant",
        content: "Lo siento, hubo un error. Inténtalo de nuevo."
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setTyping(false);
    }
  };

  // 🔥 TEMAS PARA CHAT IA
  const theme = {
    container: {
      background: isDarkMode
        ? "linear-gradient(135deg, #1a1a2e, #16213e)"
        : "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      borderRadius: "16px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      border: `1px solid ${isDarkMode ? "#333" : "#e1e5e9"}`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "500px",
      maxHeight: "70vh"
    },
    header: {
      background: isDarkMode
        ? "linear-gradient(135deg, #0f3460, #1a1a2e)"
        : "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${isDarkMode ? "#333" : "#ddd"}`
    },
    tabs: {
      display: "flex",
      gap: "8px"
    },
    tab: {
      padding: "8px 16px",
      borderRadius: "20px",
      background: "rgba(255,255,255,0.1)",
      color: "white",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.3s ease"
    },
    activeTab: {
      background: "rgba(255,255,255,0.2)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
    },
    chatBox: {
      flex: 1,
      padding: "16px",
      overflowY: "auto",
      background: isDarkMode ? "#16213e" : "#ffffff",
      scrollbarWidth: "thin",
      scrollbarColor: isDarkMode ? "#333 #16213e" : "#ccc #fff"
    },
    message: {
      marginBottom: "16px",
      padding: "12px 16px",
      borderRadius: "12px",
      maxWidth: "80%",
      wordWrap: "break-word",
      fontSize: "14px",
      lineHeight: "1.4"
    },
    userMessage: {
      background: isDarkMode
        ? "linear-gradient(135deg, #667eea, #764ba2)"
        : "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      marginLeft: "auto",
      textAlign: "right"
    },
    aiMessage: {
      background: isDarkMode ? "#2a2a4e" : "#f1f3f4",
      color: isDarkMode ? "#e0e0e0" : "#333",
      marginRight: "auto"
    },
    inputContainer: {
      padding: "16px",
      background: isDarkMode ? "#1a1a2e" : "#f8f9fa",
      borderTop: `1px solid ${isDarkMode ? "#333" : "#e1e5e9"}`,
      display: "flex",
      gap: "8px",
      alignItems: "center"
    },
    input: {
      flex: 1,
      padding: "12px 16px",
      borderRadius: "24px",
      border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
      background: isDarkMode ? "#2a2a4e" : "#ffffff",
      color: isDarkMode ? "#e0e0e0" : "#333",
      fontSize: "14px",
      outline: "none"
    },
    button: {
      padding: "12px 20px",
      borderRadius: "24px",
      border: "none",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.3s ease"
    }
  };

  return (
    <motion.div
      style={theme.container}
      layoutId="chat-container"
      variants={slideInDownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* HEADER CON PESTAÑAS */}
      <motion.div style={theme.header} layoutId="chat-header">
        <div style={theme.tabs}>
          <button
            style={{
              ...theme.tab,
              ...(activeTab === "ai" ? theme.activeTab : {})
            }}
            onClick={() => setActiveTab("ai")}
          >
            🤖 IA
          </button>
          <button
            style={{
              ...theme.tab,
              ...(activeTab === "messages" ? theme.activeTab : {})
            }}
            onClick={() => setActiveTab("messages")}
          >
            💬 Mensajes
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={toggleTheme}
            style={{
              ...theme.tab,
              fontSize: "16px",
              padding: "4px 8px"
            }}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <button
            onClick={onClose}
            style={{
              ...theme.tab,
              fontSize: "16px",
              padding: "4px 8px"
            }}
          >
            ✕
          </button>
        </div>
      </motion.div>

      {/* CONTENIDO - CHAT IA */}
      <AnimatePresence mode="wait">
        {activeTab === "ai" && (
          <motion.div
            key="ai-chat"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* BOTONES DE ACCIÓN PARA IA */}
            <div style={{
              padding: "8px 16px",
              background: isDarkMode ? "#1a1a2e" : "#f8f9fa",
              borderBottom: `1px solid ${isDarkMode ? "#333" : "#e1e5e9"}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{
                fontSize: "12px",
                color: isDarkMode ? "#888" : "#666"
              }}>
                Asistente IA - 🟢 Conectado
              </span>
              <button
                onClick={clearAiChat}
                style={{
                  padding: "4px 8px",
                  borderRadius: "12px",
                  border: "none",
                  background: "rgba(255,0,0,0.1)",
                  color: "#ff6b6b",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                🗑️ Limpiar
              </button>
            </div>

            {/* MENSAJES IA */}
            <div style={theme.chatBox} ref={chatRef}>
              <AnimatePresence>
                {aiMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    style={{
                      ...theme.message,
                      ...(msg.role === "user" ? theme.userMessage : theme.aiMessage)
                    }}
                    variants={chatBubbleVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </motion.div>
                ))}

                {typing && (
                  <motion.div
                    style={{
                      ...theme.message,
                      ...theme.aiMessage,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                    variants={chatBubbleVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div style={{
                      display: "flex",
                      gap: "4px"
                    }}>
                      <motion.div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#667eea"
                        }}
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: 0
                        }}
                      />
                      <motion.div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#667eea"
                        }}
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: 0.2
                        }}
                      />
                      <motion.div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#667eea"
                        }}
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: 0.4
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "12px", color: "#888" }}>
                      Pensando...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* INPUT PARA IA */}
            <form onSubmit={sendAiMessage} style={theme.inputContainer}>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Pregúntale a la IA..."
                style={theme.input}
                disabled={typing}
              />
              <button
                type="submit"
                disabled={!aiInput.trim() || typing}
                style={{
                  ...theme.button,
                  opacity: (!aiInput.trim() || typing) ? 0.5 : 1,
                  cursor: (!aiInput.trim() || typing) ? "not-allowed" : "pointer"
                }}
              >
                {typing ? "⏳" : "📤"}
              </button>
            </form>
          </motion.div>
        )}

        {/* CONTENIDO - MENSAJES DIRECTOS */}
        {activeTab === "messages" && (
          <motion.div
            key="direct-messages"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%" }}
          >
            <DirectMessages onClose={() => {}} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default UnifiedChat;