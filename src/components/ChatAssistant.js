import React, { useState } from "react";
import API_URL from "../config";

function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const token = localStorage.getItem("token");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token // 🔥 NO SE TOCA
        },
        body: JSON.stringify({ pregunta: input })
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        { from: "ai", text: data.respuesta }
      ]);

    } catch (error) {
      console.log(error);

      setMessages([
        ...newMessages,
        { from: "ai", text: "Error al conectar con el asistente 😢" }
      ]);
    }

    setInput("");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🤖 Asistente Fitness</h2>

      <div style={styles.chatBox}>
        {messages.length === 0 && (
          <p style={styles.placeholder}>
            Pregunta algo sobre entrenamiento 💪
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={
              msg.from === "user"
                ? styles.userWrapper
                : styles.aiWrapper
            }
          >
            <div
              style={
                msg.from === "user"
                  ? styles.userMessage
                  : styles.aiMessage
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.button}>
          ➤
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "420px",
    margin: "auto",
    background: "#121212",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 0 25px rgba(0,255,136,0.08)",
    color: "#fff"
  },
  title: {
    color: "#00ff88",
    marginBottom: "10px"
  },
  chatBox: {
    height: "350px",
    overflowY: "auto",
    padding: "10px",
    borderRadius: "12px",
    background: "#0f0f0f",
    border: "1px solid #222",
    marginBottom: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  placeholder: {
    color: "#666",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "120px"
  },
  userWrapper: {
    display: "flex",
    justifyContent: "flex-end"
  },
  aiWrapper: {
    display: "flex",
    justifyContent: "flex-start"
  },
  userMessage: {
    background: "#00ff88",
    color: "#000",
    padding: "10px 14px",
    borderRadius: "16px 16px 0 16px",
    maxWidth: "70%",
    fontSize: "14px",
    fontWeight: "500"
  },
  aiMessage: {
    background: "#1f1f1f",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "16px 16px 16px 0",
    maxWidth: "70%",
    fontSize: "14px"
  },
  inputArea: {
    display: "flex",
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
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#00ff88",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

export default ChatAssistant;