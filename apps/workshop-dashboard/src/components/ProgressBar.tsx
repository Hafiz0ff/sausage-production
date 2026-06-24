import type { StatusTone } from '../domain/types';

interface ProgressBarProps {
  value: number;
  tone?: StatusTone;
  label?: string;
}

export function ProgressBar({ value, tone = 'accent', label }: ProgressBarProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="progress-cell">
      <div className="progress-bar" aria-label={label ?? `Прогресс ${normalizedValue}%`}>
        <span className={`progress-bar-fill progress-${tone}`} style={{ width: `${normalizedValue}%` }} />
      </div>
      <span className="progress-value">{normalizedValue}%</span>
    </div>
  );
}
