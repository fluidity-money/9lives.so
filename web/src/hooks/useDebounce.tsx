import { useRef } from "react";

function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delayInSeconds: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    // Clear the existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delayInSeconds * 1000);
  };
}

export default useDebounce;
