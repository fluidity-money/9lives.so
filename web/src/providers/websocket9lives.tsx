import { useWebSocketStore } from "@/stores/websocket";
import { useEffect } from "react";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const connect = useWebSocketStore((s) => s.connect);
  const disconnect = useWebSocketStore((s) => s.disconnect);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return <>{children}</>;
}
