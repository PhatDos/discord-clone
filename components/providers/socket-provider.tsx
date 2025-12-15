"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("SocketProvider rendered", process.env.NEXT_PUBLIC_SITE_URL!);

    const socketInstance = ClientIO(process.env.NEXT_PUBLIC_SITE_URL!, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      secure: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", socketInstance.id);
    });
    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket DISconnected:", socketInstance.id);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
