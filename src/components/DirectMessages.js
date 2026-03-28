import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Typography, TextField, IconButton, List, ListItem, ListItemButton, ListItemAvatar, Avatar, Badge, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { slideInDownVariants, chatBubbleVariants } from "../utils/motion-variants";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../hooks/useAuth";

/**
 * 🎯 DirectMessages - Chats directos entre usuarios
 * Características:
 * - Lista de conversaciones activas
 * - Chat en tiempo real con Socket.io
 * - Animaciones profesionales
 * - Indicador de escritura
 */
function DirectMessages({ onClose }) {
  const { user, token } = useAuth();
  const { socket, connected } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket: Escuchar mensajes directos
  useEffect(() => {
    if (!socket) return;

    // Conectar a sala de DMs
    socket.emit("join_dm_room", { userId: user?.id });

    const handleDMReceived = ({ from, fromUser, message, timestamp }) => {
      if (selectedConversation?.id === from || selectedConversation?.id === fromUser?.id) {
        setMessages((prev) => [...prev, { from, fromUser, message, timestamp, isReceived: true }]);
      }

      // Actualizar lista de conversaciones
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === from || c.id === fromUser?.id);
        if (exists) {
          return prev.map((c) =>
            c.id === from || c.id === fromUser?.id
              ? { ...c, lastMessage: message, timestamp, unread: true }
              : c
          );
        } else {
          return [...prev, {
            id: fromUser?.id,
            name: fromUser?.nombre || "Usuario",
            avatar: fromUser?.avatar || "/default-avatar.png",
            lastMessage: message,
            timestamp,
            unread: true
          }];
        }
      });
    };

    const handleDMTyping = ({ from, isTyping: typingStatus }) => {
      if (selectedConversation?.id === from) {
        setTyping(typingStatus);
      }
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("dm_received", handleDMReceived);
    socket.on("dm_typing", handleDMTyping);
    socket.on("online_users", handleOnlineUsers);

    return () => {
      socket.off("dm_received", handleDMReceived);
      socket.off("dm_typing", handleDMTyping);
      socket.off("online_users", handleOnlineUsers);
    };
  }, [socket, selectedConversation, user?.id]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage = {
      from: user?.id,
      to: selectedConversation.id,
      message: messageInput,
      timestamp: new Date().toISOString(),
      isSent: true
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");

    if (socket && connected) {
      socket.emit("send_dm", {
        to: selectedConversation.id,
        message: messageInput
      });
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]); // En producción, cargarías el historial
    
    // Marcar como leído
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversation.id ? { ...c, unread: false } : c
      )
    );
  };

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <motion.div
      style={styles.wrapper}
      variants={slideInDownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div style={styles.container} layoutId="dm-container">
        {!selectedConversation ? (
          <>
            {/* HEADER - Lista de chats */}
            <motion.div style={styles.header} layoutId="dm-header">
              <div style={styles.headerLeft}>
                <div style={styles.avatarIcon}>💬</div>
                <div>
                  <div style={styles.title}>Mensajes Directos</div>
                  <div style={styles.subTitle}>Chats privados con otros usuarios</div>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                style={styles.closeButton}
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </motion.div>

            {/* LISTA DE CONVERSACIONES */}
            <motion.div style={styles.chatBox}>
              <AnimatePresence mode="popLayout">
                {conversations.length === 0 ? (
                  <motion.p
                    style={styles.placeholder}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Sin conversaciones aún. Busca un usuario para empezar.
                  </motion.p>
                ) : (
                  <List sx={{ width: "100%", p: 0 }}>
                    {conversations.map((conv, idx) => (
                      <motion.div
                        key={conv.id}
                        variants={chatBubbleVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <ListItemButton
                          onClick={() => handleSelectConversation(conv)}
                          sx={{
                            bgcolor: "transparent",
                            borderBottom: "1px solid #2a2a2a",
                            "&:hover": {
                              bgcolor: "rgba(0, 255, 136, 0.05)"
                            },
                            transition: "all 0.2s ease"
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                              }}
                              variant="dot"
                              sx={{
                                "& .MuiBadge-badge": {
                                  backgroundColor: isUserOnline(conv.id) ? "#44b700" : "#bdbdbd",
                                  color: isUserOnline(conv.id) ? "#44b700" : "#bdbdbd",
                                  boxShadow: `0 0 0 2px #0d0d0d`,
                                  "&::after": {
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "50%",
                                    animation: isUserOnline(conv.id) ? "ripple 1.2s infinite ease-in-out" : "none",
                                    border: "1px solid currentColor",
                                    content: '""',
                                  },
                                },
                              }}
                            >
                              <Avatar
                                alt={conv.name}
                                src={conv.avatar}
                                sx={{ border: "2px solid #00ff88" }}
                              />
                            </Badge>
                          </ListItemAvatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ color: "#fff", fontWeight: "600" }}>
                              {conv.name}
                            </Typography>
                            <Typography
                              sx={{
                                color: conv.unread ? "#00ff88" : "#777",
                                fontSize: "12px",
                                fontWeight: conv.unread ? "600" : "400"
                              }}
                              noWrap
                            >
                              {conv.lastMessage}
                            </Typography>
                          </Box>
                          {conv.unread && (
                            <motion.div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: "#00ff88"
                              }}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                        </ListItemButton>
                      </motion.div>
                    ))}
                  </List>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        ) : (
          <>
            {/* HEADER - Chat abierto */}
            <motion.div style={styles.header} layoutId="dm-header">
              <motion.button
                onClick={() => setSelectedConversation(null)}
                style={styles.backButton}
                whileHover={{ scale: 1.1 }}
              >
                ←
              </motion.button>
              <div style={styles.headerLeft}>
                <Avatar
                  src={selectedConversation.avatar}
                  sx={{ width: 36, height: 36, border: "2px solid #00ff88" }}
                />
                <div>
                  <div style={styles.title}>{selectedConversation.name}</div>
                  <div style={{
                    ...styles.subTitle,
                    color: isUserOnline(selectedConversation.id) ? "#00ff88" : "#888"
                  }}>
                    {isUserOnline(selectedConversation.id) ? "🟢 En línea" : "🔴 Desconectado"}
                  </div>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                style={styles.closeButton}
                whileHover={{ scale: 1.2, rotate: 90 }}
              >
                ✕
              </motion.button>
            </motion.div>

            {/* MENSAJES */}
            <motion.div style={styles.chatBox} layoutId="dm-messages">
              <AnimatePresence mode="popLayout">
                {messages.length === 0 && (
                  <motion.p
                    style={styles.placeholder}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Comienza la conversación 👋
                  </motion.p>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    style={msg.isSent ? styles.userMessageWrapper : styles.receivedMessageWrapper}
                    variants={chatBubbleVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <motion.div
                      style={msg.isSent ? styles.userMessage : styles.receivedMessage}
                      whileHover={{ y: -2 }}
                    >
                      {msg.message}
                    </motion.div>
                  </motion.div>
                ))}

                {typing && (
                  <motion.div
                    style={styles.receivedMessageWrapper}
                    variants={chatBubbleVariants}
                    initial="hidden"
                    animate="visible"
                    layout
                  >
                    <div style={styles.receivedMessage}>
                      <motion.div style={{ display: "flex", gap: "4px" }}>
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#00ff88"
                            }}
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.8,
                              delay: i * 0.15,
                              repeat: Infinity
                            }}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </motion.div>

            {/* INPUT ÁREA */}
            <motion.div style={styles.inputArea} layoutId="dm-input">
              <motion.input
                type="text"
                placeholder="Escribe un mensaje..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                style={styles.input}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                whileFocus={{
                  boxShadow: "0 0 0 2px rgba(0, 255, 136, 0.2)"
                }}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                style={styles.sendButton}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SendIcon sx={{ fontSize: 18, color: "#000" }} />
              </motion.button>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

const styles = {
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
  avatarIcon: {
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
  closeButton: {
    color: "#ffffff",
    fontSize: "18px",
    background: "transparent",
    border: "none",
    padding: "0",
    cursor: "pointer",
    lineHeight: "1"
  },
  backButton: {
    color: "#00ff88",
    fontSize: "20px",
    background: "transparent",
    border: "none",
    padding: "0 8px",
    cursor: "pointer",
    fontWeight: "bold"
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
  userMessageWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    marginLeft: "15%"
  },
  receivedMessageWrapper: {
    display: "flex",
    justifyContent: "flex-start",
    marginRight: "15%"
  },
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
  receivedMessage: {
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
  inputArea: {
    display: "flex",
    padding: "12px",
    borderTop: "1px solid #1f1f1f",
    gap: "10px",
    background: "#0d0d0d",
    alignItems: "center"
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
  sendButton: {
    padding: "8px 12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #00ff88, #00bfa5)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  }
};

export default DirectMessages;
