import { useEffect, useState } from 'react';
import { type Toast, subscribe } from '@/lib/toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribe(setToasts), []);

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '28rem',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            color: '#fff',
            background: t.type === 'error' ? '#dc2626' : t.type === 'success' ? '#16a34a' : '#2563eb',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            fontSize: '0.875rem',
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
