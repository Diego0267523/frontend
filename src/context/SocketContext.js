import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import API_URL from "../utils/config";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext({ socket: null, connected: false });

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      setSocket(null);
      return undefined;
    }

    const socketClient = io(API_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { token },
    });

    setSocket(socketClient);

    const handleConnect = () => {
      setConnected(true);
      console.log("✅ Socket conectado:", socketClient.id);
    };

    const handleDisconnect = () => {
      setConnected(false);
      console.log("⚠️ Socket desconectado");
    };

    socketClient.on("connect", handleConnect);
    socketClient.on("disconnect", handleDisconnect);

    return () => {
      socketClient.off("connect", handleConnect);
      socketClient.off("disconnect", handleDisconnect);
      socketClient.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
