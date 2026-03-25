import React, { useState } from "react";
import API_URL from "../config";
import { TextField, Button, Box, Typography } from "@mui/material";

function ChatAssistant() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    const newChat = [...chat, { sender: "user", text: message }];
    setChat(newChat);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      setChat([
        ...newChat,
        { sender: "ai", text: data.reply || "No response" }
      ]);
    } catch (err) {
      console.log(err);
    }

    setMessage("");
  };

  return (
    <Box>
      {/* MENSAJES */}
      <Box
        style={{
          height: "200px",
          overflowY: "auto",
          marginBottom: "10px"
        }}
      >
        {chat.map((msg, i) => (
          <Typography
            key={i}
            align={msg.sender === "user" ? "right" : "left"}
            style={{
              margin: "5px",
              padding: "8px",
              borderRadius: "10px",
              background:
                msg.sender === "user" ? "#1976d2" : "#e0e0e0",
              color: msg.sender === "user" ? "white" : "black"
            }}
          >
            {msg.text}
          </Typography>
        ))}
      </Box>

      {/* INPUT */}
      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          label="Pregunta rápida..."
        />
        <Button variant="contained" onClick={sendMessage}>
          Enviar
        </Button>
      </Box>
    </Box>
  );
}

export default ChatAssistant;