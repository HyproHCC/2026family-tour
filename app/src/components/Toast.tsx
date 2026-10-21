import React, { useState, useEffect } from 'react';

let toastTimeout: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<(msg: string | null) => void>();

export function showToast(message: string, duration = 2500): void {
  if (toastTimeout) clearTimeout(toastTimeout);
  listeners.forEach((fn) => fn(message));
  toastTimeout = setTimeout(() => {
    listeners.forEach((fn) => fn(null));
  }, duration);
}

export const ToastContainer: React.FC = () => {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const handler = (m: string | null) => setMsg(m);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  if (!msg) return null;

  return <div className="toast-notice">{msg}</div>;
};
