"use client"

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import io from "socket.io-client";

// Use the type from the return type of io()
type SocketType = ReturnType<typeof io> | null;

const SocketContext = createContext<{ socket: SocketType }>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<SocketType>(null);
  const socketRef = useRef<SocketType>(null);

  useEffect(() => {
    const s = io({
      path: "/socket.io",
      transports: ["websocket"],
    });
    socketRef.current = s;
    setSocket(s);
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}; 