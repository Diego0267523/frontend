import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import API_URL from "../utils/config";

const SocketContext = createContext({ socket: null, connected: false });

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const socketClient = io(API_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { token }
    });

    setSocket(socketClient);

    socketClient.on("connect", () => {
      setConnected(true);
      console.log("✅ Socket conectado:", socketClient.id);
    });

    socketClient.on("disconnect", () => {
      setConnected(false);
      console.log("⚠️ Socket desconectado");
    });

    return () => {
      socketClient.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
