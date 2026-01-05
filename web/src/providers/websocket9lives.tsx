import { createContext, useEffect, useRef, useCallback } from "react";

export const WSContext = createContext<{
  subscribe: (fn: (msg: any) => void) => () => void;
  onOpen: (fn: () => void) => () => void;
  send: (data: any) => void;
} | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const listeners = useRef(new Set<(msg: any) => void>());
  const openHandlers = useRef(new Set<() => void>());

  useEffect(() => {
    const ws = new WebSocket("wss://websocket.9lives.so");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS opened");
      openHandlers.current.forEach((fn) => fn());
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

  const subscribe = (fn: (msg: any) => void) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  };

  const onOpen = useCallback((fn: () => void) => {
    openHandlers.current.add(fn);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      fn();
    }

    return () => {
      openHandlers.current.delete(fn);
    };
  }, []);

  const send = (data: any) => {
    wsRef.current?.send(JSON.stringify(data));
  };

  return (
    <WSContext.Provider value={{ subscribe, onOpen, send }}>
      {children}
    </WSContext.Provider>
  );
}
