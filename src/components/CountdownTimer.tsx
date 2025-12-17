import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetTime: string; // ISO timestamp
  onComplete?: () => void;
}

export default function CountdownTimer({ targetTime, onComplete }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  const calculateSecondsLeft = useCallback(() => {
    const target = new Date(targetTime).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.ceil((target - now) / 1000));
    return diff;
  }, [targetTime]);

  useEffect(() => {
    setSecondsLeft(calculateSecondsLeft());

    const interval = setInterval(() => {
      const remaining = calculateSecondsLeft();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateSecondsLeft, onComplete]);

  if (secondsLeft <= 0) {
    return null;
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
      <Clock className="w-4 h-4" />
      <span className="text-sm">
        Please wait{' '}
        <span className="font-mono font-semibold">
          {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`}
        </span>
        {' '}before generating again
      </span>
    </div>
  );
}
