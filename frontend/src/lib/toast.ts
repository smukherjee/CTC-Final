/**
 * Minimal event-bus toast system — no external dependency needed.
 * Components subscribe via useToast(); apiClient interceptor dispatches via showToast().
 */

type ToastType = 'error' | 'success' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (toasts: Toast[]) => void;

let _toasts: Toast[] = [];
const _listeners = new Set<Listener>();

function notify() {
  _listeners.forEach((l) => l([..._toasts]));
}

export function showToast(message: string, type: ToastType = 'info') {
  const id = `${Date.now()}-${Math.random()}`;
  _toasts = [..._toasts, { id, message, type }];
  notify();
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== id);
    notify();
  }, 5000);
}

export function subscribe(listener: Listener): () => void {
  _listeners.add(listener);
  return () => { _listeners.delete(listener); };
}
