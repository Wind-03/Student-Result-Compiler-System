import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

const toneClasses = {
  success: 'border-pass-500/30 bg-pass-50 text-pass-600',
  error: 'border-fail-500/30 bg-fail-50 text-fail-600',
  info: 'border-brand-400/30 bg-brand-50 text-brand-600',
};

export default function ToastStack() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => dismissToast(t.id), 4000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-4 bottom-5 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-5 sm:w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`rounded-sm border px-4 py-3 text-sm shadow-sm ${toneClasses[t.variant]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
