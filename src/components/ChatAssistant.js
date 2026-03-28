import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_URL from "../utils/config";
import { useSocket } from "../context/SocketContext";

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
    <div style={theme.wrapper}>
      <div style={theme.container}>
        <div style={theme.header}>
          <div style={theme.headerLeft}>
            <div style={theme.avatarCoach}>🤖</div>
            <div>
              <div style={theme.title}>Asistente Fitness</div>
              <div style={theme.subTitle}>Pregúntame sobre comidas, rutinas y progreso</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onClose ? onClose : () => {}}
              style={{
                ...theme.closeButton,
                border: "none",
                background: "transparent",
                fontSize: "18px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
            <span style={theme.statusDot}>{connected ? "🟢 Conectado" : "🔴 Desconectado"}</span>
            <div style={{ display: "flex", gap: "8px", marginLeft: "8px" }}>
              <button style={theme.themeButton} onClick={toggleTheme}>
                {isDarkMode ? "☀️" : "🌙"}
              </button>
              <button style={theme.clearButton} onClick={clearChat}>🗑️</button>
            </div>
          </div>
        </div>

        <div style={theme.chatBox} ref={chatRef}>
          {messages.length === 0 && (
            <p style={theme.placeholder}>Pregunta algo sobre entrenamiento 💪</p>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              style={msg.from === "user" ? theme.userWrapper : theme.aiWrapper}
            >
              <div style={msg.from === "user" ? theme.userMessage : theme.aiMessage}>
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
              </div>
            </div>
          ))}

          {typing && (
            <div style={theme.aiWrapper}>
              <div style={theme.typingContainer}>
                <div style={theme.typingBubble}>
                  <div style={theme.typingDots}>
                  <span className="typing-dot" style={theme.dot1}></span>
                  <span className="typing-dot" style={theme.dot2}></span>
                  <span className="typing-dot" style={theme.dot3}></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={theme.inputArea}>
          <input
            type="text"
            placeholder="Escribe tu pregunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={theme.input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} style={theme.button} disabled={!input.trim()}>
            ➤
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .typing-dot:nth-child(1) { animation: typing 1.4s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation: typing 1.4s infinite ease-in-out 0.2s; }
        .typing-dot:nth-child(3) { animation: typing 1.4s infinite ease-in-out 0.4s; }
      `}</style>
    </div>
  );
}

// 🎨 TEMAS OSCURO Y CLARO
const darkTheme = {
  wrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "10px",
    background: "#0a0a0a"
  },
    boxShadow: "0 0 25px rgba(0,255,136,0.08)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  header: {
    padding: "12px 16px",
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
    background: "#00ff88",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px"
  },
  title: {
    color: "#00ff88",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "4px"
  },
  subTitle: {
    color: "#aaa",
    fontSize: "12px"
  },
  statusDot: {
    fontSize: "12px",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "12px",
    border: "1px solid #00ff88",
    background: "rgba(0, 255, 136, 0.15)",
    fontWeight: "600"
  },
  themeButton: {
    border: "1px solid #00ff88",
    background: "transparent",
    color: "#00ff88",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "16px"
  },
  clearButton: {
    border: "1px solid #ff4444",
    background: "transparent",
    color: "#ff4444",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "16px"
  },
  closeButton: {
    color: "#ffffff",
    fontSize: "18px",
    background: "transparent",
    border: "none",
    padding: "0",
    lineHeight: "1",
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "#0d0d0d"
  },
  placeholder: {
    color: "#666",
    textAlign: "center",
    marginTop: "50%"
  },
  userWrapper: { display: "flex", justifyContent: "flex-end", marginLeft: "20%" },
  aiWrapper: { display: "flex", justifyContent: "flex-start", marginRight: "20%" },
  userMessage: {
    background: "linear-gradient(120deg,#7dff59,#00cc88)",
    color: "#000",
    padding: "12px 16px",
    borderRadius: "16px 16px 0 16px",
    maxWidth: "75%",
    wordBreak: "break-word",
    fontSize: "14px",
    lineHeight: "1.4"
  },
  aiMessage: {
    background: "#1f1f1f",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "16px 16px 16px 0",
    maxWidth: "75%",
    wordBreak: "break-word",
    fontSize: "14px",
    lineHeight: "1.5"
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
    alignItems: "center"
  },
  typingDots: {
    display: "flex",
    gap: "4px",
    alignItems: "center"
  },
  dot1: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#00ff88",
    animation: "typing 1.4s infinite ease-in-out",
    display: "inline-block"
  },
  dot2: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#00ff88",
    animation: "typing 1.4s infinite ease-in-out 0.2s",
    display: "inline-block"
  },
  dot3: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#00ff88",
    animation: "typing 1.4s infinite ease-in-out 0.4s",
    display: "inline-block"
  },
  inputArea: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #1f1f1f",
    gap: "10px",
    background: "#0d0d0d"
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#1a1a1a",
    color: "#fff",
    outline: "none",
    fontSize: "14px"
  },
  button: {
    padding: "0 16px",
    borderRadius: "10px",
    border: "none",
    background: "#00ff88",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
    opacity: 1,
    transition: "opacity 0.2s",
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed"
    }
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
    boxShadow: "0 0 25px rgba(0,0,0,0.1)"
  },
  header: {
    ...darkTheme.header,
    background: "linear-gradient(145deg, #f8f8f8, #ffffff)",
    borderBottom: "1px solid #e0e0e0"
  },
  title: {
    ...darkTheme.title,
    color: "#00aa66"
  },
  avatarCoach: {
    ...darkTheme.avatarCoach,
    background: "#00aa66"
  },
  themeButton: {
    ...darkTheme.themeButton,
    border: "1px solid #00aa66",
    color: "#00aa66"
  },
  clearButton: {
    ...darkTheme.clearButton,
    border: "1px solid #ff6666",
    color: "#ff6666"
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
    background: "linear-gradient(120deg,#66cc99,#00aa66)",
    color: "#fff"
  },
  aiMessage: {
    ...darkTheme.aiMessage,
    background: "#f0f0f0",
    color: "#333"
  },
  typingBubble: {
    ...darkTheme.typingBubble,
    background: "#f0f0f0"
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
    borderTop: "1px solid #e0e0e0"
  },
  input: {
    ...darkTheme.input,
    background: "#ffffff",
    border: "1px solid #ddd",
    color: "#333"
  },
  button: {
    ...darkTheme.button,
    background: "#00aa66"
  },
  markdownStrong: "#00aa66",
  codeBg: "#f5f5f5"
};

export default ChatAssistant;