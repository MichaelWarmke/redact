import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RedactionItem } from '../types';
import { REDACTION_DEFINITIONS } from '../data/mockAircraftData';
import { Tooltip } from './Tooltip';
import { ShieldAlert, Edit3, RotateCcw, Lock } from 'lucide-react';

interface RedactionBadgeProps {
  item: RedactionItem;
  onEdit: (item: RedactionItem, e?: React.MouseEvent) => void;
  onRevert: (itemId: string) => void;
}

export const RedactionBadge: React.FC<RedactionBadgeProps> = ({
  item,
  onEdit,
  onRevert,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const badgeRef = useRef<HTMLButtonElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const def = REDACTION_DEFINITIONS[item.code] || REDACTION_DEFINITIONS['CUSTOM'];

  const updateCoords = () => {
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - 350);
    const top =
      rect.bottom + 220 > window.innerHeight ? rect.top - 195 : rect.bottom + 6;
    setPopoverCoords({ top: Math.max(8, top), left: Math.max(8, left) });
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    updateCoords();
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowTooltip(false);
    }, 120);
  };

  useEffect(() => {
    if (showTooltip) {
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
      return () => {
        window.removeEventListener('scroll', updateCoords, true);
        window.removeEventListener('resize', updateCoords);
      };
    }
  }, [showTooltip]);

  return (
    <div className="inline-flex items-center ml-2.5 select-none font-sans text-xs h-5">
      <button
        ref={badgeRef}
        onClick={(e) => {
          setShowTooltip(false);
          onEdit(item, e);
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`group inline-flex items-center gap-1.5 px-2 h-5 rounded border shadow-sm transition-all text-[11px] font-medium tracking-tight leading-none ${def.badgeColor}`}
      >
        <Lock className="w-3 h-3 text-current opacity-80 shrink-0" />
        <span className="font-semibold tracking-wider font-mono">
          REDACTED: {item.code === 'CUSTOM' ? item.customLabel || 'CUSTOM' : item.code}
        </span>
        <span className="text-[9px] px-1 py-0.5 rounded bg-black/40 border border-white/10 uppercase font-mono tracking-tighter leading-none">
          {def.classificationLevel}
        </span>
      </button>

      {/* Portal Hover Card / Popover */}
      {showTooltip &&
        createPortal(
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'fixed',
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              zIndex: 9990,
            }}
            className="w-80 p-3 bg-[#25272b] border border-[#4e5157] rounded-md shadow-2xl text-left text-xs backdrop-blur-md select-none"
          >
            <div className="flex items-start justify-between border-b border-[#393b40] pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white">{item.code}</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/70 border border-red-700/50 text-red-300">
                {def.classificationLevel}
              </span>
            </div>

            <p className="text-[#bcbec4] text-[11px] leading-relaxed mb-2">
              {def.description}
            </p>

            <div className="bg-[#1e1f22] p-2 rounded border border-[#393b40] mb-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-[#707278]">
                <span>Reviewer:</span>
                <span className="text-[#bcbec4] font-medium">{item.reviewer}</span>
              </div>
              <div className="flex justify-between text-[#707278]">
                <span>Timestamp:</span>
                <span className="text-[#bcbec4] font-mono">{item.timestamp}</span>
              </div>
              {item.justification && (
                <div className="pt-1 border-t border-[#2b2d30] text-[#a1a3ab] italic">
                  "{item.justification}"
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#393b40]">
              <Tooltip content="Revert Redaction" side="top">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevert(item.id);
                    setShowTooltip(false);
                  }}
                  aria-label="Revert Redaction"
                  className="p-1.5 rounded bg-[#313438] hover:bg-[#393b40] text-gray-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              <Tooltip content="Edit Redaction Code" side="top">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item, e);
                    setShowTooltip(false);
                  }}
                  aria-label="Edit Redaction Code"
                  className="p-1.5 rounded bg-[#3574f0] hover:bg-[#3068d8] text-white transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
