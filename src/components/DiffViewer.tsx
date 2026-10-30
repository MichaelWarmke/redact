import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DiffLine } from '../utils/jsonDiffEngine';
import { RedactionItem } from '../types';
import { renderHighlightedJsonLine } from '../utils/syntaxHighlight';
import { RedactionBadge } from './RedactionBadge';
import { Tooltip } from './Tooltip';
import {
  ChevronRight,
  RotateCcw,
  Plus,
} from 'lucide-react';

interface DiffViewerProps {
  diffLines: DiffLine[];
  onOpenRedactionModal: (item: Partial<RedactionItem>, e?: React.MouseEvent) => void;
  onRevertRedaction: (itemId: string) => void;
  onEditRedaction: (item: RedactionItem, e?: React.MouseEvent) => void;
  syncScroll: boolean;
  searchQuery: string;
  viewMode: 'side-by-side' | 'unified';
  currentDiffIndex: number;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  diffLines,
  onOpenRedactionModal,
  onRevertRedaction,
  onEditRedaction,
  syncScroll,
  searchQuery,
  viewMode,
  currentDiffIndex,
}) => {
  // Single shared scroll container when syncScroll is ON (so Left, Center, and Right scroll & rubber-band as one!)
  const sharedScrollRef = useRef<HTMLDivElement>(null);
  // Independent scroll refs when syncScroll is toggled OFF
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const unifiedScrollRef = useRef<HTMLDivElement>(null);

  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);

  // List of line indices that are modified/redacted
  const diffLineIndices = useMemo(() => {
    return diffLines
      .map((line, idx) => (line.isRedacted ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [diffLines]);

  // Scroll to active difference when currentDiffIndex changes
  useEffect(() => {
    if (diffLineIndices.length === 0 || currentDiffIndex < 0) return;
    const targetLineIndex = diffLineIndices[currentDiffIndex];
    if (targetLineIndex === undefined) return;

    const targetScrollTop = Math.max(0, targetLineIndex * 24 - 120);

    if (viewMode === 'unified') {
      unifiedScrollRef.current?.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    } else if (syncScroll) {
      sharedScrollRef.current?.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    } else {
      leftScrollRef.current?.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      rightScrollRef.current?.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  }, [currentDiffIndex, diffLineIndices, viewMode, syncScroll]);

  // Jump to specific line from minimap
  const scrollToLine = (lineIdx: number) => {
    const targetScrollTop = Math.max(0, lineIdx * 24 - 120);
    sharedScrollRef.current?.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    leftScrollRef.current?.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    rightScrollRef.current?.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    unifiedScrollRef.current?.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
  };

  const isLineMatchingSearch = (text: string) => {
    if (!searchQuery.trim()) return false;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  if (viewMode === 'unified') {
    return (
      <div className="flex-1 flex flex-col bg-[#1e1f22] overflow-hidden select-text font-mono text-[12.5px]">
        {/* Unified Header */}
        <div className="h-8 bg-[#25272b] border-b border-[#393b40] px-4 flex items-center justify-between text-xs text-[#bcbec4]">
          <span className="font-sans font-semibold text-gray-300">
            Unified Chunk Diff View (Combined Redactions & Originals)
          </span>
          <span className="text-[11px] text-[#707278]">
            <span className="text-red-400 font-bold">- Redacted Raw</span> |{' '}
            <span className="text-emerald-400 font-bold">+ Proposal Cleared</span>
          </span>
        </div>

        <div ref={unifiedScrollRef} className="flex-1 overflow-auto">
          {diffLines.map((line) => {
            const isDiff = line.isRedacted;
            const searchMatch = isLineMatchingSearch(line.originalText);

            if (isDiff) {
              return (
                <React.Fragment key={`unified-${line.lineIndex}`}>
                  {/* Original line (deletion) */}
                  <div className="flex items-center h-6 min-h-[24px] max-h-[24px] hover:bg-[#2b2d30]/60 bg-[#3d2328]/50 border-l-2 border-red-500/80 text-red-200 leading-6">
                    <div className="w-14 px-2 text-right text-[#707278] select-none text-xs border-r border-[#393b40]/60">
                      -{line.globalLineNumber}
                    </div>
                    <div className="px-3 flex-1 flex items-center">
                      <span className="text-red-400 select-none mr-2 font-bold">-</span>
                      <span className="line-through opacity-75">{line.originalText}</span>
                    </div>
                  </div>

                  {/* Redacted line (addition) */}
                  <div className="flex items-center h-6 min-h-[24px] max-h-[24px] hover:bg-[#2b2d30]/60 bg-[#23382c]/60 border-l-2 border-emerald-500/80 text-emerald-200 leading-6">
                    <div className="w-14 px-2 text-right text-[#707278] select-none text-xs border-r border-[#393b40]/60">
                      +{line.globalLineNumber}
                    </div>
                    <div className="px-3 flex-1 flex items-center">
                      <span className="text-emerald-400 select-none mr-2 font-bold">+</span>
                      {renderHighlightedJsonLine(line.redactedText)}
                      {line.redactionItem && (
                        <RedactionBadge
                          item={line.redactionItem}
                          onEdit={onEditRedaction}
                          onRevert={onRevertRedaction}
                        />
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            }

            return (
              <div
                key={`unified-${line.lineIndex}`}
                className={`flex items-center h-6 min-h-[24px] max-h-[24px] hover:bg-[#2b2d30]/40 leading-6 ${
                  searchMatch ? 'bg-amber-950/40 border-l-2 border-amber-500' : ''
                }`}
              >
                <div className="w-14 px-2 text-right text-[#4b5059] select-none text-xs border-r border-[#393b40]/40">
                  {line.globalLineNumber}
                </div>
                <div className="px-3 flex-1">
                  {renderHighlightedJsonLine(line.originalText)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e1f22] overflow-hidden">
      {/* Pane Sub-headers (JetBrains Diff Header) */}
      <div className="h-8 bg-[#25272b] border-b border-[#393b40] flex items-center text-xs select-none">
        {/* Left pane header */}
        <div className="flex-1 px-4 flex items-center justify-between border-r border-[#393b40]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-semibold text-gray-200">
              ORIGINAL COPY
            </span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1e1f22] text-[#707278] border border-[#393b40]">
            READ-ONLY MASTER
          </span>
        </div>

        {/* Center action ribbon header spacer */}
        <div className="w-10 bg-[#222428] border-r border-[#393b40] flex items-center justify-center shrink-0">
          <ChevronRight className="w-3.5 h-3.5 text-[#707278]" />
        </div>

        {/* Right pane header */}
        <div className="flex-1 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-gray-200">
              REDACTED WORKING COPY
            </span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
            PROPOSAL DELIVERABLE
          </span>
        </div>

        {/* Far right overview minimap header spacer */}
        <div className="w-4 bg-[#25272b] shrink-0"></div>
      </div>

      {/* Main Split Comparison Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {syncScroll ? (
          /* ================= UNIFIED SINGLE SCROLL CONTAINER (syncScroll = ON) =================
             All 3 columns (Left, Center, Right) live inside ONE single native scroll container,
             so they scroll and rubber-band together as one unified surface! */
          <div
            ref={sharedScrollRef}
            className="flex-1 overflow-y-auto overflow-x-auto bg-[#1e1f22] select-text font-mono text-[12.5px]"
          >
            <div className="flex min-w-full pb-4">
              {/* LEFT COLUMN */}
              <div className="flex-1 min-w-0 border-r border-[#393b40] overflow-clip">
                {diffLines.map((line) => {
                  const isRedacted = line.isRedacted;
                  const isHovered = hoveredLineIndex === line.lineIndex;
                  const searchMatch = isLineMatchingSearch(line.originalText);

                  return (
                    <div
                      key={`left-${line.lineIndex}`}
                      onMouseEnter={() => setHoveredLineIndex(line.lineIndex)}
                      onMouseLeave={() => setHoveredLineIndex(null)}
                      className={`flex items-center h-6 min-h-[24px] max-h-[24px] leading-6 transition-colors group ${
                        isRedacted
                          ? 'bg-[#3e282d]/70 border-l-2 border-[#84383e]'
                          : isHovered
                          ? 'bg-[#2b2d30]/50'
                          : ''
                      } ${searchMatch ? 'bg-amber-950/40 outline outline-1 outline-amber-500/50' : ''}`}
                    >
                      {/* Line Number Gutter */}
                      <div className="w-14 px-2 text-right text-[#4b5059] group-hover:text-[#bcbec4] select-none text-xs border-r border-[#2b2d30] shrink-0 font-mono h-6 flex items-center justify-end">
                        {line.globalLineNumber}
                      </div>

                      {/* Line Content */}
                      <div className="px-2.5 flex-1 flex items-center justify-between whitespace-pre h-6 min-w-0">
                        <div className="flex items-center h-6 whitespace-pre">
                          {renderHighlightedJsonLine(line.originalText)}
                        </div>

                        {/* Quick Icon-Only Redact Trigger on Hover */}
                        {line.canRedact && !isRedacted && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity select-none ml-2 flex items-center shrink-0">
                            <Tooltip content={`Redact ${line.fieldKey}`} side="left">
                              <button
                                onClick={(e) =>
                                  onOpenRedactionModal(
                                    {
                                      lineIndex: line.lineIndex,
                                      globalLineNumber: line.globalLineNumber,
                                      jsonPath: `parts[${line.partIndex}].${line.fieldKey}`,
                                      originalValue: line.fieldValue,
                                      isApplied: true,
                                    },
                                    e
                                  )
                                }
                                aria-label="Redact Field"
                                className="p-1 rounded bg-[#3574f0] hover:bg-[#3068d8] text-white shadow-sm"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </Tooltip>
                          </div>
                        )}

                        {isRedacted && (
                          <span className="font-sans text-[10px] text-red-300 font-semibold uppercase px-1.5 h-4 inline-flex items-center rounded bg-red-950/80 border border-red-700/60 select-none ml-2 leading-none shrink-0">
                            Targeted
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CENTER ACTION GUTTER */}
              <div className="w-10 bg-[#25272b] border-r border-[#393b40] shrink-0 select-none">
                {diffLines.map((line) => {
                  const isRedacted = line.isRedacted;
                  const isHovered = hoveredLineIndex === line.lineIndex;

                  return (
                    <div
                      key={`center-${line.lineIndex}`}
                      onMouseEnter={() => setHoveredLineIndex(line.lineIndex)}
                      onMouseLeave={() => setHoveredLineIndex(null)}
                      className={`h-6 min-h-[24px] max-h-[24px] flex items-center justify-center relative transition-colors ${
                        isRedacted ? 'bg-[#312328]/60' : isHovered ? 'bg-[#2b2d30]/60' : ''
                      }`}
                    >
                      {isRedacted ? (
                        <Tooltip content="Revert Redaction (Restore Original)" side="top">
                          <button
                            onClick={() =>
                              line.redactionItem && onRevertRedaction(line.redactionItem.id)
                            }
                            aria-label="Revert Redaction"
                            className="p-1 rounded bg-[#3d2328] hover:bg-red-900 border border-[#84383e] text-red-300 hover:text-white transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </Tooltip>
                      ) : line.canRedact ? (
                        <div
                          className={`transition-opacity ${
                            isHovered ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                          }`}
                        >
                          <Tooltip content="Apply Redaction to Right Pane" side="top">
                            <button
                              onClick={(e) =>
                                onOpenRedactionModal(
                                  {
                                    lineIndex: line.lineIndex,
                                    globalLineNumber: line.globalLineNumber,
                                    jsonPath: `parts[${line.partIndex}].${line.fieldKey}`,
                                    originalValue: line.fieldValue,
                                    isApplied: true,
                                  },
                                  e
                                )
                              }
                              aria-label="Apply Redaction"
                              className="p-1 rounded bg-[#2b2d30] hover:bg-[#3574f0] border border-[#4e5157] text-[#bcbec4] hover:text-white transition-colors"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-[#393b40]/40" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* RIGHT COLUMN */}
              <div className="flex-1 min-w-0 overflow-clip">
                {diffLines.map((line) => {
                  const isRedacted = line.isRedacted;
                  const isHovered = hoveredLineIndex === line.lineIndex;
                  const searchMatch = isLineMatchingSearch(line.redactedText);

                  return (
                    <div
                      key={`right-${line.lineIndex}`}
                      onMouseEnter={() => setHoveredLineIndex(line.lineIndex)}
                      onMouseLeave={() => setHoveredLineIndex(null)}
                      className={`flex items-center h-6 min-h-[24px] max-h-[24px] leading-6 transition-colors group ${
                        isRedacted
                          ? 'bg-[#23382c]/70 border-l-2 border-[#356e4e]'
                          : isHovered
                          ? 'bg-[#2b2d30]/50'
                          : ''
                      } ${searchMatch ? 'bg-amber-950/40 outline outline-1 outline-amber-500/50' : ''}`}
                    >
                      {/* Line Number Gutter */}
                      <div className="w-14 px-2 text-right text-[#4b5059] group-hover:text-[#bcbec4] select-none text-xs border-r border-[#2b2d30] shrink-0 font-mono h-6 flex items-center justify-end">
                        {line.globalLineNumber}
                      </div>

                      {/* Line Content with Redaction Badge */}
                      <div className="px-2.5 flex-1 flex items-center whitespace-pre h-6 min-w-0">
                        <div className="flex items-center h-6">
                          {renderHighlightedJsonLine(line.redactedText)}
                        </div>

                        {line.redactionItem && (
                          <RedactionBadge
                            item={line.redactionItem}
                            onEdit={onEditRedaction}
                            onRevert={onRevertRedaction}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ================= INDEPENDENT SCROLL CONTAINERS (syncScroll = OFF) ================= */
          <>
            <div
              ref={leftScrollRef}
              className="flex-1 overflow-auto bg-[#1e1f22] select-text font-mono text-[12.5px] border-r border-[#393b40]"
            >
              <div className="min-w-fit pb-4">
                {diffLines.map((line) => {
                  const isRedacted = line.isRedacted;
                  const isHovered = hoveredLineIndex === line.lineIndex;
                  const searchMatch = isLineMatchingSearch(line.originalText);

                  return (
                    <div
                      key={`left-ind-${line.lineIndex}`}
                      onMouseEnter={() => setHoveredLineIndex(line.lineIndex)}
                      onMouseLeave={() => setHoveredLineIndex(null)}
                      className={`flex items-center h-6 min-h-[24px] max-h-[24px] leading-6 overflow-hidden transition-colors group ${
                        isRedacted
                          ? 'bg-[#3e282d]/70 border-l-2 border-[#84383e]'
                          : isHovered
                          ? 'bg-[#2b2d30]/50'
                          : ''
                      } ${searchMatch ? 'bg-amber-950/40 outline outline-1 outline-amber-500/50' : ''}`}
                    >
                      <div className="w-14 px-2 text-right text-[#4b5059] group-hover:text-[#bcbec4] select-none text-xs border-r border-[#2b2d30] shrink-0 font-mono h-6 flex items-center justify-end">
                        {line.globalLineNumber}
                      </div>
                      <div className="px-2.5 flex-1 flex items-center justify-between whitespace-pre h-6">
                        <div className="flex items-center h-6">
                          {renderHighlightedJsonLine(line.originalText)}
                        </div>
                        {line.canRedact && !isRedacted && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity select-none ml-2 flex items-center">
                            <Tooltip content={`Redact ${line.fieldKey}`} side="left">
                              <button
                                onClick={(e) =>
                                  onOpenRedactionModal(
                                    {
                                      lineIndex: line.lineIndex,
                                      globalLineNumber: line.globalLineNumber,
                                      jsonPath: `parts[${line.partIndex}].${line.fieldKey}`,
                                      originalValue: line.fieldValue,
                                      isApplied: true,
                                    },
                                    e
                                  )
                                }
                                aria-label="Redact Field"
                                className="p-1 rounded bg-[#3574f0] hover:bg-[#3068d8] text-white shadow-sm"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-10 bg-[#25272b] border-r border-[#393b40] shrink-0 select-none flex items-center justify-center text-[10px] text-[#707278]">
              <div className="rotate-90 whitespace-nowrap font-mono tracking-widest opacity-50">
                UNSYNCED
              </div>
            </div>

            <div
              ref={rightScrollRef}
              className="flex-1 overflow-auto bg-[#1e1f22] select-text font-mono text-[12.5px]"
            >
              <div className="min-w-fit pb-4">
                {diffLines.map((line) => {
                  const isRedacted = line.isRedacted;
                  const isHovered = hoveredLineIndex === line.lineIndex;
                  const searchMatch = isLineMatchingSearch(line.redactedText);

                  return (
                    <div
                      key={`right-ind-${line.lineIndex}`}
                      onMouseEnter={() => setHoveredLineIndex(line.lineIndex)}
                      onMouseLeave={() => setHoveredLineIndex(null)}
                      className={`flex items-center h-6 min-h-[24px] max-h-[24px] leading-6 overflow-hidden transition-colors group ${
                        isRedacted
                          ? 'bg-[#23382c]/70 border-l-2 border-[#356e4e]'
                          : isHovered
                          ? 'bg-[#2b2d30]/50'
                          : ''
                      } ${searchMatch ? 'bg-amber-950/40 outline outline-1 outline-amber-500/50' : ''}`}
                    >
                      <div className="w-14 px-2 text-right text-[#4b5059] group-hover:text-[#bcbec4] select-none text-xs border-r border-[#2b2d30] shrink-0 font-mono h-6 flex items-center justify-end">
                        {line.globalLineNumber}
                      </div>
                      <div className="px-2.5 flex-1 flex items-center whitespace-pre h-6">
                        <div className="flex items-center h-6">
                          {renderHighlightedJsonLine(line.redactedText)}
                        </div>
                        {line.redactionItem && (
                          <RedactionBadge
                            item={line.redactionItem}
                            onEdit={onEditRedaction}
                            onRevert={onRevertRedaction}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ================= JETBRAINS FAR-RIGHT DIFF OVERVIEW RULER (MINIMAP) ================= */}
        <div
          className="w-4 bg-[#212326] border-l border-[#393b40] relative cursor-pointer select-none shrink-0"
          title="Diff Overview Ruler - Click to jump to redaction"
        >
          {diffLines.map((line, idx) => {
            if (!line.isRedacted) return null;
            const topPercent = (idx / diffLines.length) * 100;
            return (
              <Tooltip
                key={`marker-${idx}`}
                content={`Jump to Line ${line.globalLineNumber}: ${line.redactionItem?.code || 'Redacted'}`}
                side="left"
              >
                <div
                  onClick={() => scrollToLine(idx)}
                  style={{ top: `${topPercent}%` }}
                  className="absolute left-0 right-0 h-1.5 bg-red-500 hover:h-2.5 hover:bg-amber-400 transition-all z-10 shadow-sm"
                />
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};
