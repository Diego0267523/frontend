import React, { useState } from "react";
import API_URL from "../config";

function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const token = localStorage.getItem("token"); // si usas auth

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
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
      <h2>🤖 Asistente Fitness</h2>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={
              msg.from === "user"
                ? styles.userMessage
                : styles.aiMessage
            }
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Pregunta algo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.button}>
          Enviar
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "400px",
    margin: "auto",
    textAlign: "center"
  },
  chatBox: {
    height: "300px",
    overflowY: "auto",
    border: "1px solid #ccc",
    padding: "10px",
    marginBottom: "10px"
  },
  userMessage: {
    textAlign: "right",
    background: "#DCF8C6",
    padding: "8px",
    margin: "5px",
    borderRadius: "10px"
  },
  aiMessage: {
    textAlign: "left",
    background: "#eee",
    padding: "8px",
    margin: "5px",
    borderRadius: "10px"
  },
  inputArea: {
    display: "flex"
  },
  input: {
    flex: 1,
    padding: "10px"
  },
  button: {
    padding: "10px"
  }
};

export default ChatAssistant;