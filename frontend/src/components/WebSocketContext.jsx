import React, { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Use environment variable or fallback to localhost:8080
    const wsUrl = import.meta.env.VITE_APP_WEBSOCKET_URL || "ws://localhost:8080";
    console.log("Connecting to WebSocket:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connected successfully");
      setSocket(ws);
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket connection error:", error);
    };
    
    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setSocket(null);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
