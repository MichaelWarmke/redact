import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { RedactionItem, RedactionReasonCode } from '../types';
import { REDACTION_DEFINITIONS } from '../data/mockAircraftData';
import { Tooltip } from './Tooltip';
import { ShieldAlert, X, Check, ChevronDown } from 'lucide-react';

interface RedactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  redactionItem: Partial<RedactionItem> | null;
  anchor: { x: number; y: number } | null;
  onSave: (item: Partial<RedactionItem>, applyToAllMatching?: boolean) => void;
}

export const RedactionModal: React.FC<RedactionModalProps> = ({
  isOpen,
  onClose,
  redactionItem,
  anchor,
  onSave,
}) => {
  const [selectedCode, setSelectedCode] = useState<RedactionReasonCode | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [justification, setJustification] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 100,
    left: 100,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (redactionItem) {
      setSelectedCode(redactionItem.code ?? null);
      setCustomLabel(redactionItem.customLabel || '');
      setJustification(redactionItem.justification || '');
      setApplyToAll(false);
    }
  }, [redactionItem]);

  // Position and clamp the context menu within the viewport
  useLayoutEffect(() => {
    if (!isOpen) return;

    const baseX = anchor ? anchor.x : window.innerWidth / 2 - 150;
    const baseY = anchor ? anchor.y : window.innerHeight / 3;

    const menuEl = menuRef.current;
    const menuWidth = menuEl ? menuEl.offsetWidth : 300;
    const menuHeight = menuEl ? menuEl.offsetHeight : 260;

    const clampedLeft = Math.max(
      12,
      Math.min(baseX, window.innerWidth - menuWidth - 12)
    );
    const clampedTop = Math.max(
      12,
      Math.min(baseY, window.innerHeight - menuHeight - 12)
    );

    setPosition({ top: clampedTop, left: clampedLeft });
  }, [isOpen, anchor, selectedCode]);

  // Close on click outside or Escape key (context menu behavior)
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !redactionItem) return null;

  const fieldName = redactionItem.jsonPath?.split('.').pop() || 'field';
  const selectedDef = selectedCode ? REDACTION_DEFINITIONS[selectedCode] : null;

  const handleApprove = () => {
    if (!selectedCode) return;
    onSave(
      {
        ...redactionItem,
        code: selectedCode,
        customLabel: selectedCode === 'CUSTOM' ? customLabel : undefined,
        justification,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        reviewer: redactionItem.reviewer || 'Maj. E. Vance (USAF)',
      },
      applyToAll
    );
    onClose();
  };

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9995,
      }}
      className="w-[300px] bg-[#25272b] border border-[#4e5157] rounded-md shadow-2xl overflow-hidden text-xs select-none font-sans"
    >
      {/* Compact Context Menu Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#2b2d30] border-b border-[#393b40]">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="font-semibold text-[#dfe1e5] truncate">
            Redact <code className="font-mono text-amber-300">{fieldName}</code>
          </span>
        </div>
        <Tooltip content="Close (Esc)" side="top">
          <button
            onClick={onClose}
            className="p-0.5 rounded text-[#707278] hover:text-white hover:bg-[#393b40] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Stage 1: When NO reason is selected yet, show the full list of reasons */}
      {!selectedDef ? (
        <div className="p-1 max-h-64 overflow-y-auto divide-y divide-[#2b2d30]/60">
          {Object.values(REDACTION_DEFINITIONS).map((def) => (
            <button
              key={def.code}
              type="button"
              onClick={() => setSelectedCode(def.code)}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#2e436e] text-[#bcbec4] hover:text-white transition-colors flex items-start justify-between gap-2 group"
            >
              <div className="min-w-0 flex-1">
                <span className="font-mono font-semibold text-[11px] text-white">
                  {def.code}
                </span>
                <p className="text-[10px] truncate mt-0.5 text-[#707278] group-hover:text-blue-100">
                  {def.description}
                </p>
              </div>
              <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-black/40 border border-white/10 text-gray-300 shrink-0 mt-0.5">
                {def.classificationLevel}
              </span>
            </button>
          ))}
        </div>
      ) : (
        /* Stage 2: Once a reason IS selected, hide the list and show ONLY the selected item + memo & options + approve button */
        <>
          <div className="p-1.5 bg-[#25272b]">
            <Tooltip content="Click to change redaction reason" side="top">
              <button
                type="button"
                onClick={() => setSelectedCode(null)}
                className="w-full text-left px-2.5 py-1.5 rounded bg-[#2e436e] hover:bg-[#344c7c] border border-[#3574f0]/60 text-white transition-colors flex items-start justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-blue-300 shrink-0" />
                    <span className="font-mono font-semibold text-[11px] text-white">
                      {selectedDef.code}
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-100 leading-snug mt-0.5">
                    {selectedDef.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-black/40 border border-white/10 text-gray-200">
                    {selectedDef.classificationLevel}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-200 opacity-80" />
                </div>
              </button>
            </Tooltip>
          </div>

          <div className="p-2.5 bg-[#1e1f22] border-t border-[#393b40] space-y-2.5">
            {/* Custom Code Input if CUSTOM is selected */}
            {selectedCode === 'CUSTOM' && (
              <div>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Custom code (e.g. DOD-SEC-REV-4)"
                  className="w-full bg-[#25272b] border border-[#4e5157] rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#3574f0] font-mono"
                  autoFocus
                />
              </div>
            )}

            {/* Memo / Justification */}
            <div>
              <label className="block text-[10px] font-medium text-[#707278] mb-1 uppercase tracking-wider">
                Audit Memo / Justification
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Optional justification memo..."
                rows={2}
                autoFocus={selectedCode !== 'CUSTOM'}
                className="w-full bg-[#25272b] border border-[#4e5157] rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#3574f0] resize-none"
              />
            </div>

            {/* Batch option */}
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#bcbec4] hover:text-white">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="rounded text-[#3574f0] focus:ring-0"
              />
              <span className="truncate">
                Apply to all <code className="font-mono text-amber-300">{fieldName}</code> in chunk
              </span>
            </label>

            {/* Approval Button at the bottom */}
            <Tooltip content="Apply & Record Redaction Directive" side="bottom">
              <button
                type="button"
                onClick={handleApprove}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#3574f0] hover:bg-[#3068d8] text-white font-medium text-[11px] shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve Redaction</span>
              </button>
            </Tooltip>
          </div>
        </>
      )}
    </div>,
    document.body
  );
};
