import { useCallback, useRef } from "react";

export default function useDebouncedCallback(
  callback: (...args: any[]) => void,
  delay: number,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  );
}
