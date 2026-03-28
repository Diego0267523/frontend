import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_URL from "../utils/config";
import { useSocket } from "../context/SocketContext";
import {
  chatBubbleVariants,
  slideInDownVariants,
} from "../utils/motion-variants";

/**
 * 🎯 ChatAssistant - Asistente IA con animaciones profesionales
 * Características:
 * - Animaciones suaves de mensajes
 * - Transiciones profesionales
 * - Indicador de escritura animado
 * - Soporte para temas claro/oscuro
 */
function ChatAssistant({ onClose }) {
  const [messages, setMessages] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("chat")) || [];
    return saved.slice(-10);
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("chatTheme") !== "light";
  });

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chat");
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("chatTheme", newTheme ? "dark" : "light");
  };

  const token = localStorage.getItem("token");
  const chatRef = useRef(null);
  const { socket, connected } = useSocket();

  // 🔥 AUTO SCROLL AL FINAL
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, typing]);

  // 🔥 Escuchar eventos socket de IA
  useEffect(() => {
    if (!socket) return;

    const handleAIResponse = ({ pregunta, respuesta }) => {
      setMessages((prev) => [...prev, { from: 'ai', text: respuesta }]);
      setTyping(false);
    };

    const handleAIError = (message) => {
      setMessages((prev) => [...prev, { from: 'ai', text: `Error IA: ${message}` }]);
      setTyping(false);
    };

    socket.on('ai_response', handleAIResponse);
    socket.on('ai_error', handleAIError);

    return () => {
      socket.off('ai_response', handleAIResponse);
      socket.off('ai_error', handleAIError);
    };
  }, [socket]);

  // 🔥 GUARDAR HISTORIAL EN LOCAL (solo últimos 10 mensajes)
  useEffect(() => {
    const limited = messages.slice(-10);
    localStorage.setItem("chat", JSON.stringify(limited));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setTyping(true);

    if (socket && connected) {
      socket.emit("ask_ai", { pregunta: input });
      return;
    }

    // Fallback HTTP si socket no está disponible
    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pregunta: input })
      });

      console.log("📡 PETICIÓN IA enviada:", input, "status:", res.status);

      if (!res.ok) {
        const errData = await res.json();
        console.error("❌ RESPUESTA ERROR IA:", errData);
        setMessages([...newMessages, { from: "ai", text: `Error IA: ${errData?.message || "Sin detalle"}` }]);
        setTyping(false);
        return;
      }

      const data = await res.json();
      console.log("📥 RESPUESTA IA:", data);
      const delay = Math.random() * 1000 + 700;
      setTimeout(() => {
        setMessages([...newMessages, { from: "ai", text: data.respuesta || "No tengo respuesta ahora 🤔" }]);
        setTyping(false);
      }, delay);

    } catch (error) {
      console.error("🔥 ERROR CONNECT IA:", error);
      setTimeout(() => {
        setMessages([...newMessages, { from: "ai", text: "Error al conectar con la IA 😢" }]);
        setTyping(false);
      }, 1000);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <motion.div
      style={theme.wrapper}
      variants={slideInDownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        style={theme.container}
        layoutId="chat-container"
      >
        {/* HEADER */}
        <motion.div style={theme.header} layoutId="chat-header">
          <motion.div style={theme.headerLeft}>
            <motion.div
              style={theme.avatarCoach}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              🤖
            </motion.div>
            <div>
              <div style={theme.title}>Asistente Fitness</div>
              <div style={theme.subTitle}>Pregúntame sobre comidas, rutinas y progreso</div>
            </div>
          </motion.div>

          <motion.div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <motion.button
              onClick={onClose ? onClose : () => {}}
              style={{
                ...theme.closeButton,
                border: "none",
                background: "transparent",
                fontSize: "18px",
                cursor: "pointer"
              }}
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              ✕
            </motion.button>

            <motion.span style={theme.statusDot}>
              {connected ? "🟢 Conectado" : "🔴 Desconectado"}
            </motion.span>

            <div style={{ display: "flex", gap: "8px", marginLeft: "8px" }}>
              <motion.button
                style={theme.themeButton}
                onClick={toggleTheme}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {isDarkMode ? "☀️" : "🌙"}
              </motion.button>

              <motion.button
                style={theme.clearButton}
                onClick={clearChat}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                🗑️
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* CHAT BOX */}
        <motion.div style={theme.chatBox} ref={chatRef} layoutId="chat-messages">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && (
              <motion.p
                style={theme.placeholder}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Pregunta algo sobre entrenamiento 💪
              </motion.p>
            )}

            {messages.map((msg, index) => (
              <motion.div
                key={`${index}-${msg.from}`}
                style={msg.from === "user" ? theme.userWrapper : theme.aiWrapper}
                variants={chatBubbleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <motion.div
                  style={msg.from === "user" ? theme.userMessage : theme.aiMessage}
                  whileHover={{ y: -2 }}
                >
                  {msg.from === "ai" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p style={{ margin: 0, lineHeight: 1.5 }}>{children}</p>,
                        strong: ({ children }) => <strong style={{ color: theme.markdownStrong }}>{children}</strong>,
                        ul: ({ children }) => <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ul>,
                        ol: ({ children }) => <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ol>,
                        li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
                        code: ({ children }) => (
                          <code style={{
                            background: theme.codeBg,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.9em'
                          }}>
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre style={{
                            background: theme.codeBg,
                            padding: '12px',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            margin: '8px 0'
                          }}>
                            {children}
                          </pre>
                        )
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </motion.div>
              </motion.div>
            ))}

            {typing && (
              <motion.div
                key="typing"
                style={theme.aiWrapper}
                variants={chatBubbleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <motion.div style={theme.typingContainer}>
                  <motion.div
                    style={theme.typingBubble}
                    animate={{
                      boxShadow: [
                        "0 0 0px rgba(0, 255, 136, 0)",
                        "0 0 8px rgba(0, 255, 136, 0.3)",
                        "0 0 0px rgba(0, 255, 136, 0)"
                      ]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div style={theme.typingDots} layout>
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={`dot-${i}`}
                          style={theme[`dot${i + 1}`]}
                          animate={{
                            y: [0, -10, 0],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{
                            duration: 1.4,
                            delay: i * 0.2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* INPUT AREA */}
        <motion.div style={theme.inputArea} layoutId="chat-input">
          <motion.input
            type="text"
            placeholder="Escribe tu pregunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={theme.input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            whileFocus={{
              boxShadow: `0 0 0 2px ${isDarkMode ? "rgba(0, 255, 136, 0.2)" : "rgba(0, 170, 102, 0.2)"}`
            }}
            transition={{ duration: 0.2 }}
          />

          <motion.button
            onClick={sendMessage}
            style={theme.button}
            disabled={!input.trim()}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 8px 16px ${isDarkMode ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 170, 102, 0.3)"}`
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            ➤
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// 🎨 TEMAS OSCURO Y CLARO (igual que antes, pero optimizado)
const darkTheme = {
  wrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "10px",
    background: "#0a0a0a"
  },
  container: {
    width: "100%",
    maxWidth: "100%",
    height: "100%",
    maxHeight: "70vh",
    borderRadius: "18px",
    boxShadow: "0 12px 48px rgba(0, 255, 136, 0.12), 0 0 0 1px rgba(0, 255, 136, 0.1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#0d0d0d"
  },
  header: {
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(145deg, #0c0c0c, #131313)",
    borderBottom: "1px solid #1f1f1f"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  avatarCoach: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #00ff88, #00bfa5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    boxShadow: "0 4px 12px rgba(0, 255, 136, 0.3)"
  },
  title: {
    color: "#00ff88",
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "2px"
  },
  subTitle: {
    color: "#888",
    fontSize: "11px",
    fontWeight: "500"
  },
  statusDot: {
    fontSize: "11px",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "12px",
    border: "1px solid #00ff88",
    background: "rgba(0, 255, 136, 0.12)",
    fontWeight: "600"
  },
  themeButton: {
    border: "1px solid #00ff88",
    background: "transparent",
    color: "#00ff88",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease"
  },
  clearButton: {
    border: "1px solid #ff4444",
    background: "transparent",
    color: "#ff4444",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease"
  },
  closeButton: {
    color: "#ffffff",
    fontSize: "18px",
    background: "transparent",
    border: "none",
    padding: "0",
    lineHeight: "1",
    cursor: "pointer"
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#0d0d0d"
  },
  placeholder: {
    color: "#555",
    textAlign: "center",
    margin: "auto",
    fontSize: "14px",
    fontWeight: "500"
  },
  userWrapper: { display: "flex", justifyContent: "flex-end", marginLeft: "15%" },
  aiWrapper: { display: "flex", justifyContent: "flex-start", marginRight: "15%" },
  userMessage: {
    background: "linear-gradient(120deg, #7dff59, #00cc88)",
    color: "#000",
    padding: "11px 15px",
    borderRadius: "16px 16px 0 16px",
    maxWidth: "80%",
    wordBreak: "break-word",
    fontSize: "14px",
    lineHeight: "1.4",
    fontWeight: "500",
    boxShadow: "0 4px 12px rgba(0, 255, 136, 0.2)"
  },
  aiMessage: {
    background: "#1f1f1f",
    color: "#fff",
    padding: "11px 15px",
    borderRadius: "16px 16px 16px 0",
    maxWidth: "80%",
    wordBreak: "break-word",
    fontSize: "14px",
    lineHeight: "1.5",
    border: "1px solid #2a2a2a"
  },
  typingContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  typingBubble: {
    background: "#1f1f1f",
    padding: "12px 16px",
    borderRadius: "16px 16px 16px 0",
    display: "flex",
    alignItems: "center",
    border: "1px solid #2a2a2a"
  },
  typingDots: {
    display: "flex",
    gap: "5px",
    alignItems: "center"
  },
  dot1: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#00ff88",
    display: "inline-block"
  },
  dot2: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#00ff88",
    display: "inline-block"
  },
  dot3: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#00ff88",
    display: "inline-block"
  },
  inputArea: {
    display: "flex",
    padding: "12px",
    borderTop: "1px solid #1f1f1f",
    gap: "10px",
    background: "#0d0d0d"
  },
  input: {
    flex: 1,
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#1a1a1a",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
    transition: "all 0.2s ease"
  },
  button: {
    padding: "0 16px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #00ff88, #00bfa5)",
    color: "#000",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s ease"
  },
  markdownStrong: "#00ff88",
  codeBg: "#2a2a2a"
};

const lightTheme = {
  ...darkTheme,
  wrapper: {
    ...darkTheme.wrapper,
    background: "#f5f5f5"
  },
  container: {
    ...darkTheme.container,
    background: "#ffffff",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.08)"
  },
  header: {
    ...darkTheme.header,
    background: "linear-gradient(145deg, #f8f8f8, #ffffff)",
    borderBottom: "1px solid #e8e8e8"
  },
  avatarCoach: {
    ...darkTheme.avatarCoach,
    background: "linear-gradient(135deg, #00cc99, #00aa66)",
    boxShadow: "0 4px 12px rgba(0, 170, 102, 0.2)"
  },
  title: {
    ...darkTheme.title,
    color: "#00aa66"
  },
  subTitle: {
    ...darkTheme.subTitle,
    color: "#999"
  },
  statusDot: {
    ...darkTheme.statusDot,
    border: "1px solid #00aa66",
    background: "rgba(0, 170, 102, 0.08)"
  },
  themeButton: {
    ...darkTheme.themeButton,
    border: "1px solid #00aa66",
    color: "#00aa66"
  },
  clearButton: {
    ...darkTheme.clearButton,
    border: "1px solid #ff7777",
    color: "#ff7777"
  },
  chatBox: {
    ...darkTheme.chatBox,
    background: "#fafafa"
  },
  placeholder: {
    ...darkTheme.placeholder,
    color: "#999"
  },
  userMessage: {
    ...darkTheme.userMessage,
    background: "linear-gradient(120deg, #66cc99, #00aa66)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(0, 170, 102, 0.2)"
  },
  aiMessage: {
    ...darkTheme.aiMessage,
    background: "#f5f5f5",
    color: "#333",
    border: "1px solid #e0e0e0"
  },
  typingBubble: {
    ...darkTheme.typingBubble,
    background: "#f5f5f5",
    border: "1px solid #e0e0e0"
  },
  dot1: {
    ...darkTheme.dot1,
    background: "#00aa66"
  },
  dot2: {
    ...darkTheme.dot2,
    background: "#00aa66"
  },
  dot3: {
    ...darkTheme.dot3,
    background: "#00aa66"
  },
  inputArea: {
    ...darkTheme.inputArea,
    background: "#f8f8f8",
    borderTop: "1px solid #e8e8e8"
  },
  input: {
    ...darkTheme.input,
    background: "#ffffff",
    border: "1px solid #ddd",
    color: "#333"
  },
  button: {
    ...darkTheme.button,
    background: "linear-gradient(135deg, #00cc99, #00aa66)"
  },
  markdownStrong: "#00aa66",
  codeBg: "#f5f5f5"
};

export default ChatAssistant;
