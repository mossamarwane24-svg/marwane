import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cx } from '../lib/format';
import { useGame } from '../state/GameContext';
import { sfx } from '../lib/sound';

// ------------------------------ Barre de progression ------------------------
export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  className?: string;
  gradient?: string;
  showLabel?: boolean;
  height?: string;
}> = ({ value, max = 100, className, gradient = 'from-amber-400 to-orange-500', showLabel, height = 'h-2.5' }) => {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className={cx('w-full', className)}>
      <div className={cx('w-full overflow-hidden rounded-full border border-ninja-line bg-ninja-bg/70', height)}>
        <div
          className={cx('h-full rounded-full bg-gradient-to-r transition-all duration-700', gradient)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <div className="mt-1 text-right text-[11px] font-semibold text-ninja-muted">{Math.round(pct)} %</div>}
    </div>
  );
};

// ----------------------------------- Timer ---------------------------------
export const Timer: React.FC<{ seconds: number; total: number; paused?: boolean; onExpire?: () => void }> = ({
  seconds,
  total,
  paused,
  onExpire
}) => {
  const pct = Math.max(0, Math.min(100, (seconds / total) * 100));
  const danger = seconds <= 5;
  const fired = useRef(false);
  useEffect(() => {
    if (seconds <= 0 && !fired.current && onExpire) {
      fired.current = true;
      onExpire();
    }
  }, [seconds, onExpire]);
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-11 w-11">
        <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#27304f" strokeWidth="3.5" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke={danger ? '#ef4444' : pct > 50 ? '#22c55e' : '#f5a524'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className={cx('absolute inset-0 flex items-center justify-center text-sm font-black', danger && 'text-red-400')}>
          {Math.max(0, seconds)}
        </span>
      </div>
      {paused && <span className="text-xs text-ninja-muted">en pause</span>}
    </div>
  );
};

// ---------------------------------- Toasts ---------------------------------
export const Toaster: React.FC = () => {
  const { toasts } = useGame();
  const styles: Record<string, string> = {
    info: 'border-ninja-line bg-ninja-panel/95',
    success: 'border-emerald-500/50 bg-emerald-500/15',
    error: 'border-red-500/50 bg-red-500/15',
    reward: 'border-amber-400/60 bg-amber-500/15',
    badge: 'border-purple-400/60 bg-purple-500/15'
  };
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[60] flex w-[92vw] max-w-sm -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            'animate-slideUp rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur',
            styles[t.kind] || styles.info
          )}
        >
          <span className="mr-2">{t.icon || (t.kind === 'error' ? '⚠️' : '✨')}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
};

// ------------------------------- Modale ------------------------------------
export const Modal: React.FC<{ open: boolean; onClose?: () => void; title?: string; children: React.ReactNode; wide?: boolean }> = ({
  open,
  onClose,
  title,
  children,
  wide
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cx('w-full animate-pop rounded-2xl border border-ninja-line bg-ninja-panel p-5 shadow-2xl', wide ? 'max-w-2xl' : 'max-w-md')}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-3 flex items-center justify-between">
            <h3 className="h2">{title}</h3>
            {onClose && (
              <button className="btn-ghost !px-2 !py-1" onClick={onClose} aria-label="Fermer">
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// -------------------------------- Confettis --------------------------------
export const Confetti: React.FC<{ show: boolean; count?: number }> = ({ show, count = 40 }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.8 + Math.random() * 1.6,
        emoji: ['🍥', '⭐', '🔥', '🪙', '🎉', '🍃'][i % 6]
      })),
    [count, show]
  );
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute text-2xl"
          style={{
            left: `${p.left}%`,
            top: '-40px',
            animation: `fall ${p.duration}s linear ${p.delay}s forwards`
          }}
        >
          {p.emoji}
        </span>
      ))}
      <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(540deg); opacity: 0.2; } }`}</style>
    </div>
  );
};

// ------------------------------ Bouton sonore ------------------------------
export const SoundToggle: React.FC = () => {
  const { save, updateSettings, toast } = useGame();
  return (
    <button
      className="btn-ghost !px-3 !py-2"
      title={save.settings.sound ? 'Couper le son' : 'Activer le son'}
      onClick={() => {
        updateSettings({ sound: !save.settings.sound });
        if (!save.settings.sound) sfx.click();
        toast(save.settings.sound ? 'Son coupé' : 'Son activé', 'info', save.settings.sound ? '🔇' : '🔊');
      }}
    >
      {save.settings.sound ? '🔊' : '🔇'}
    </button>
  );
};

// ------------------------------ Stats / cartes ------------------------------
export const StatBox: React.FC<{ label: string; value: React.ReactNode; icon?: string; hint?: string }> = ({ label, value, icon, hint }) => (
  <div className="stat">
    <div className="text-xl">{icon}</div>
    <div className="mt-0.5 text-lg font-black">{value}</div>
    <div className="text-[11px] uppercase tracking-wide text-ninja-muted">{label}</div>
    {hint && <div className="text-[10px] text-ninja-muted/70">{hint}</div>}
  </div>
);

export const SectionTitle: React.FC<{ icon?: string; title: string; subtitle?: string; right?: React.ReactNode }> = ({
  icon,
  title,
  subtitle,
  right
}) => (
  <div className="mb-3 flex items-end justify-between gap-3">
    <div>
      <h2 className="h2 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {subtitle && <p className="text-xs text-ninja-muted">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const Tabs: React.FC<{ tabs: { id: string; label: string; icon?: string }[]; value: string; onChange: (id: string) => void }> = ({
  tabs,
  value,
  onChange
}) => (
  <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => {
          onChange(t.id);
          sfx.click();
        }}
        className={cx(
          'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-bold transition',
          value === t.id
            ? 'border-amber-400/70 bg-amber-500/20 text-amber-200'
            : 'border-ninja-line bg-ninja-panel2/60 text-ninja-muted hover:text-ninja-text'
        )}
      >
        {t.icon && <span className="mr-1">{t.icon}</span>}
        {t.label}
      </button>
    ))}
  </div>
);

// --------------------------- Boite de dialogue ------------------------------
export const ConfirmButton: React.FC<{
  label: string;
  confirmLabel?: string;
  onConfirm: () => void;
  className?: string;
}> = ({ label, confirmLabel = 'Confirmer ?', onConfirm, className }) => {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      className={className || 'btn-danger'}
      onClick={() => {
        if (armed) {
          onConfirm();
          setArmed(false);
        } else setArmed(true);
      }}
    >
      {armed ? confirmLabel : label}
    </button>
  );
};
