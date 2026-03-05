import { useState } from 'react';

interface TooltipProps {
  readonly content: string;
  readonly children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md
            bg-gray-800 px-3 py-2 text-xs text-white shadow-lg
            max-w-64 text-center whitespace-normal"
        >
          {content}
        </span>
      )}
    </span>
  );
}
