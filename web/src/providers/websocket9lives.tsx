import { createContext, useEffect, useRef } from "react";

export const WSContext = createContext<{
  subscribe: (fn: (msg: unknown) => void) => () => void;
} | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const listeners = useRef(new Set<(msg: unknown) => void>());

  useEffect(() => {
    const ws = new WebSocket("wss://websocket.9lives.so");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS opened");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      listeners.current.forEach((fn) => fn(msg));
    };

    ws.onclose = () => {
      console.log("WS closed");
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
    };

    return () => {
      ws.close();
    };
  }, []);

  const subscribe = (fn: (msg: unknown) => void) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  };

  return (
    <WSContext.Provider value={{ subscribe }}>{children}</WSContext.Provider>
  );
}
