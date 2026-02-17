import config from "@/config";
import { create } from "zustand";

type WSListener = (msg: unknown) => void;

type WSState = {
  ws: WebSocket | null;
  listeners: Set<WSListener>;
  connect: () => void;
  disconnect: () => void;
  subscribe: (fn: WSListener) => () => void;
  send: (payload: unknown) => void;
};

export const useWebSocketStore = create<WSState>((set, get) => ({
  ws: null,
  listeners: new Set(),
  connect: () => {
    if (get().ws) return;

    const ws = new WebSocket(config.NEXT_PUBLIC_WS_URL);

    ws.onopen = () => {
      console.log("WS opened");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      get().listeners.forEach((fn) => fn(msg));
    };

    ws.onclose = () => {
      console.log("WS closed");
      set({ ws: null });
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
    };

    set({ ws });
  },
  disconnect: () => {
    const ws = get().ws;
    if (ws) {
      ws.close();
      set({ ws: null });
    }
  },
  subscribe: (fn) => {
    get().listeners.add(fn);
    return () => {
      get().listeners.delete(fn);
    };
  },
  send: (payload) => {
    const ws = get().ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WS not ready, cannot send");
      return;
    }
    ws.send(JSON.stringify(payload));
  },
}));
