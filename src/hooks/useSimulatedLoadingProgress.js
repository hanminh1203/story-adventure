import { useEffect, useState } from "react";

export function useSimulatedLoadingProgress(loading) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      setProgress(100);
      return;
    }

    setProgress(0);
    let current = 0;

    const interval = window.setInterval(() => {
      const increment = current < 50 ? 5 : current < 75 ? 2 : 0.5;
      current = Math.min(90, current + increment);
      setProgress(current);
    }, 180);

    return () => window.clearInterval(interval);
  }, [loading]);

  return progress;
}
