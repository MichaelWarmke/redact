import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  shortcut?: string;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  shortcut,
  children,
  side = 'bottom',
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 6;

    let top = 0;
    let left = 0;

    if (side === 'bottom') {
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2;
    } else if (side === 'top') {
      top = rect.top - gap;
      left = rect.left + rect.width / 2;
    } else if (side === 'left') {
      top = rect.top + rect.height / 2;
      left = rect.left - gap;
    } else if (side === 'right') {
      top = rect.top + rect.height / 2;
      left = rect.right + gap;
    }

    // Clamp horizontally so it doesn't overflow right/left viewport edge
    const clampedLeft = Math.max(80, Math.min(window.innerWidth - 100, left));
    setCoords({ top, left: clampedLeft });
  };

  useEffect(() => {
    if (visible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [visible]);

  const getTransform = () => {
    if (side === 'bottom') return 'translate(-50%, 0)';
    if (side === 'top') return 'translate(-50%, -100%)';
    if (side === 'left') return 'translate(-100%, -50%)';
    return 'translate(0, -50%)';
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => {
        updatePosition();
        setVisible(true);
      }}
      onMouseLeave={() => setVisible(false)}
      onMouseDown={() => setVisible(false)}
      className="inline-flex items-center justify-center"
    >
      {children}
      {visible &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: getTransform(),
              zIndex: 9999,
            }}
            className="pointer-events-none px-2 py-1 rounded bg-[#2b2d30] border border-[#4e5157] shadow-xl text-[11px] text-[#dfe1e5] font-sans whitespace-nowrap flex items-center gap-1.5"
          >
            <span>{content}</span>
            {shortcut && (
              <span className="text-[10px] font-mono text-[#707278] bg-[#1e1f22] px-1 py-0.2 rounded border border-[#393b40]">
                {shortcut}
              </span>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
