import { useEffect, useState } from 'react';

/**
 * Reveals `text` one character at a time. Restarts whenever `text`
 * itself changes (e.g. a new notebook entry mounts this fresh).
 */
export function TypewriterText({
  text,
  speedMs = 16,
  className,
}: {
  text: string;
  speedMs?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);

  return <span className={className}>{text.slice(0, count)}</span>;
}
