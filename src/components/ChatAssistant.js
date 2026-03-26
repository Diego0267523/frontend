import React, { useState, useEffect, useRef } from "react";
import API_URL from "../config";

function ChatAssistant() {
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem("chat")) || [];
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const token = localStorage.getItem("token");
  const chatRef = useRef(null);

  // 🔥 AUTO SCROLL AL FINAL
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, typing]);

  // 🔥 GUARDAR HISTORIAL EN LOCAL
  useEffect(() => {
    localStorage.setItem("chat", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pregunta: input })
      });

      // 🔥 DEBUG: Log completo del fetch
      console.log("📡 PETICIÓN IA enviada:", input, "status:", res.status);

      if (!res.ok) {
        const errData = await res.json();
        console.error("❌ RESPUESTA ERROR IA:", errData);
        setMessages([
          ...newMessages,
          { from: "ai", text: `Error IA: ${errData?.message || "Sin detalle"}` }
        ]);
        return;
      }

      const data = await res.json();

      console.log("📥 RESPUESTA IA:", data);

      setMessages([
        ...newMessages,
        { from: "ai", text: data.respuesta || "No tengo respuesta ahora 🤔" }
      ]);

    } catch (error) {
      console.error("🔥 ERROR CONNECT IA:", error);
      setMessages([
        ...newMessages,
        { from: "ai", text: "Error al conectar con la IA 😢 revisa la consola" }
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>🤖 Asistente Fitness</h2>

        <div style={styles.chatBox} ref={chatRef}>
          {messages.length === 0 && (
            <p style={styles.placeholder}>Pregunta algo sobre entrenamiento 💪</p>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              style={msg.from === "user" ? styles.userWrapper : styles.aiWrapper}
            >
              <div style={msg.from === "user" ? styles.userMessage : styles.aiMessage}>
                {msg.text}
              </div>
            </div>
          ))}

          {typing && (
            <div style={styles.aiWrapper}>
              <div style={styles.typing}>
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
        </div>

        <div style={styles.inputArea}>
          <input
            type="text"
            placeholder="Escribe tu pregunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} style={styles.button}>➤</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "10px"
  },
  container: {
    width: "100%",
    maxWidth: "600px",
    height: "90vh",
    background: "#121212",
    borderRadius: "16px",
    boxShadow: "0 0 25px rgba(0,255,136,0.08)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  title: {
    color: "#00ff88",
    padding: "15px",
    borderBottom: "1px solid #1f1f1f",
    margin: 0
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  placeholder: {
    color: "#666",
    textAlign: "center",
    marginTop: "50%"
  },
  userWrapper: { display: "flex", justifyContent: "flex-end" },
  aiWrapper: { display: "flex", justifyContent: "flex-start" },
  userMessage: {
    background: "#00ff88",
    color: "#000",
    padding: "10px 14px",
    borderRadius: "16px 16px 0 16px",
    maxWidth: "75%",
    wordBreak: "break-word"
  },
  aiMessage: {
    background: "#1f1f1f",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "16px 16px 16px 0",
    maxWidth: "75%",
    wordBreak: "break-word"
  },
  typing: {
    background: "#1f1f1f",
    padding: "10px 14px",
    borderRadius: "16px",
    color: "#aaa",
    display: "flex",
    gap: "5px"
  },
  inputArea: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #1f1f1f",
    gap: "10px"
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#1a1a1a",
    color: "#fff",
    outline: "none"
  },
  button: {
    padding: "0 16px",
    borderRadius: "10px",
    border: "none",
    background: "#00ff88",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

export default ChatAssistant;