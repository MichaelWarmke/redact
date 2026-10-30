import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  DocumentChunk,
  RedactionItem,
  RedactionReasonCode,
} from './types';
import {
  buildInitialChunks,
  buildInitialRedactions,
  REDACTION_DEFINITIONS,
} from './data/mockAircraftData';
import { generateDiffLines } from './utils/jsonDiffEngine';
import { Toolbar } from './components/Toolbar';
import { DiffViewer } from './components/DiffViewer';
import { BottomDock } from './components/BottomDock';
import { StatusBar } from './components/StatusBar';
import { RedactionModal } from './components/RedactionModal';
import { ChunksDrawer } from './components/ChunksDrawer';
import { AuditReportModal } from './components/AuditReportModal';
import { ExportModal } from './components/ExportModal';

export function App() {
  const [chunks, setChunks] = useState<DocumentChunk[]>(() => buildInitialChunks());
  const [activeChunkId, setActiveChunkId] = useState<string>('chunk-1');
  const [redactions, setRedactions] = useState<RedactionItem[]>(() => buildInitialRedactions());
  
  const [syncScroll, setSyncScroll] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentDiffIndex, setCurrentDiffIndex] = useState<number>(0);

  // Modals & Drawers
  const [isChunksDrawerOpen, setIsChunksDrawerOpen] = useState(false);
  const [isAuditReportOpen, setIsAuditReportOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRedactionModalOpen, setIsRedactionModalOpen] = useState(false);
  const [editingRedaction, setEditingRedaction] = useState<Partial<RedactionItem> | null>(null);
  const [redactionAnchor, setRedactionAnchor] = useState<{ x: number; y: number } | null>(null);

  // Notification / toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Current active chunk
  const currentChunk = useMemo(() => {
    return chunks.find((c) => c.id === activeChunkId) || chunks[0];
  }, [chunks, activeChunkId]);

  // Compute diff lines for the active chunk
  const diffLines = useMemo(() => {
    return generateDiffLines(currentChunk, redactions);
  }, [currentChunk, redactions]);

  // List of line indices in diffLines that have active redaction
  const activeDiffIndices = useMemo(() => {
    return diffLines
      .map((line, idx) => (line.isRedacted ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [diffLines]);

  const totalDiffs = activeDiffIndices.length;

  // Next / Previous diff navigation
  const handleNextDiff = useCallback(() => {
    if (totalDiffs === 0) return;
    setCurrentDiffIndex((prev) => (prev + 1) % totalDiffs);
  }, [totalDiffs]);

  const handlePrevDiff = useCallback(() => {
    if (totalDiffs === 0) return;
    setCurrentDiffIndex((prev) => (prev - 1 + totalDiffs) % totalDiffs);
  }, [totalDiffs]);

  // Keyboard shortcut listener (JetBrains F7 / Shift+F7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F7' && !e.shiftKey) {
        e.preventDefault();
        handleNextDiff();
      } else if (e.key === 'F7' && e.shiftKey) {
        e.preventDefault();
        handlePrevDiff();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextDiff, handlePrevDiff]);

  // Save or update a redaction
  const handleSaveRedaction = (
    itemData: Partial<RedactionItem>,
    applyToAllMatching?: boolean
  ) => {
    const targetCode = (itemData.code || 'IL6-OPSEC-01') as RedactionReasonCode;
    const reviewer = itemData.reviewer || 'Maj. E. Vance (USAF)';
    const justification = itemData.justification || '';
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (applyToAllMatching && itemData.jsonPath) {
      // Find the field key (e.g. "operating_band_or_frequency" or "serial_number")
      const fieldKey = itemData.jsonPath.split('.').pop();
      if (fieldKey) {
        setRedactions((prev) => {
          const updated = [...prev];
          currentChunk.parts.forEach((part, pIdx) => {
            const path = `parts[${pIdx}].${fieldKey}`;
            const existingIdx = updated.findIndex(
              (r) => r.chunkId === currentChunk.id && r.jsonPath === path
            );

            const newItem: RedactionItem = {
              id: existingIdx !== -1 ? updated[existingIdx].id : `redact-${Date.now()}-${pIdx}`,
              chunkId: currentChunk.id,
              lineIndex: 0,
              globalLineNumber: currentChunk.startLine,
              jsonPath: path,
              originalValue: (part as any)[fieldKey] || '',
              redactedValue: '████████████████',
              code: targetCode,
              customLabel: itemData.customLabel,
              reviewer,
              timestamp: now,
              justification: `Batch rule applied: ${justification}`,
              isApplied: true,
            };

            if (existingIdx !== -1) {
              updated[existingIdx] = newItem;
            } else {
              updated.push(newItem);
            }
          });
          return updated;
        });

        showToast(`Batch redaction applied to all ${fieldKey} fields in Chunk #${currentChunk.chunkIndex}`);
        return;
      }
    }

    // Single item edit/create
    setRedactions((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === itemData.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...itemData,
          code: targetCode,
          reviewer,
          justification,
          timestamp: now,
          isApplied: true,
        } as RedactionItem;
        return updated;
      } else {
        const newItem: RedactionItem = {
          id: itemData.id || `redact-${Date.now()}`,
          chunkId: currentChunk.id,
          lineIndex: itemData.lineIndex || 0,
          globalLineNumber: itemData.globalLineNumber || currentChunk.startLine,
          jsonPath: itemData.jsonPath || '',
          originalValue: itemData.originalValue ?? '',
          redactedValue: '████████████████',
          code: targetCode,
          customLabel: itemData.customLabel,
          reviewer,
          timestamp: now,
          justification,
          isApplied: true,
        };
        return [...prev, newItem];
      }
    });

    showToast(`Redaction directive ${targetCode} applied successfully.`);
  };

  // Revert/undo redaction
  const handleRevertRedaction = (itemId: string) => {
    setRedactions((prev) => prev.filter((r) => r.id !== itemId));
    showToast('Redaction reverted to unredacted original.');
  };

  // Open redaction context menu for existing item
  const handleEditRedaction = (item: RedactionItem, e?: React.MouseEvent) => {
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRedactionAnchor({ x: rect.left, y: rect.bottom + 4 });
    } else {
      setRedactionAnchor(null);
    }
    setEditingRedaction(item);
    setIsRedactionModalOpen(true);
  };

  // Open redaction context menu to create new redaction (no reason pre-selected initially)
  const handleCreateRedaction = (partialItem: Partial<RedactionItem>, e?: React.MouseEvent) => {
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRedactionAnchor({ x: rect.right + 6, y: rect.top });
    } else {
      setRedactionAnchor(null);
    }
    setEditingRedaction({
      ...partialItem,
      code: undefined,
    });
    setIsRedactionModalOpen(true);
  };

  // Approve active chunk
  const handleApproveChunk = () => {
    setChunks((prev) =>
      prev.map((c) =>
        c.id === activeChunkId ? { ...c, status: 'REDACTED_APPROVED' } : c
      )
    );
    showToast(`Chunk #${currentChunk.chunkIndex} (${currentChunk.title}) sealed and approved for proposal.`);
  };

  const activeRedactionsCount = useMemo(() => {
    return redactions.filter((r) => r.isApplied).length;
  }, [redactions]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#1e1f22] text-[#bcbec4] font-sans overflow-hidden">
      {/* JetBrains Title / Project Header Bar */}
      <div className="h-9 bg-[#1e1f22] border-b border-[#393b40] px-3 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3574f0] flex items-center justify-center text-[8px] font-bold text-white">
            ▲
          </div>
          <span className="font-semibold text-white tracking-wide">
            AeroShield
          </span>
          <span className="text-[#707278]">|</span>
          <span className="text-gray-300 font-mono text-[11px]">
            Defense Project Proposal Declassification Workbench
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] px-2 py-0.5 rounded bg-red-950/70 border border-red-700/60 text-red-300 font-mono font-semibold">
            CONTROLLED UNCLASSIFIED INFORMATION // SP-PRVCY
          </span>
          <span className="text-xs text-[#707278]">
            Reviewer: <strong className="text-gray-200">Maj. E. Vance (USAF)</strong>
          </span>
        </div>
      </div>

      {/* Main Diff Comparison Toolbar */}
      <Toolbar
        currentChunk={currentChunk}
        totalChunks={chunks.length}
        currentDiffIndex={currentDiffIndex}
        totalDiffs={totalDiffs}
        syncScroll={syncScroll}
        onToggleSyncScroll={() => setSyncScroll(!syncScroll)}
        onPrevDiff={handlePrevDiff}
        onNextDiff={handleNextDiff}
        onOpenChunksDrawer={() => setIsChunksDrawerOpen(true)}
        onOpenAuditReport={() => setIsAuditReportOpen(true)}
        onExportJson={() => setIsExportModalOpen(true)}
        onApproveChunk={handleApproveChunk}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* Main Comparison Area */}
      <div className="flex-1 flex overflow-hidden">
        <DiffViewer
          diffLines={diffLines}
          onOpenRedactionModal={handleCreateRedaction}
          onRevertRedaction={handleRevertRedaction}
          onEditRedaction={handleEditRedaction}
          syncScroll={syncScroll}
          searchQuery={searchQuery}
          viewMode={viewMode}
          currentDiffIndex={currentDiffIndex}
        />
      </div>

      {/* Bottom Tool Dock (JetBrains Style) */}
      <BottomDock
        currentChunk={currentChunk}
        redactions={redactions}
        onRevertRedaction={handleRevertRedaction}
        onEditRedaction={handleEditRedaction}
        onJumpToLine={(lineIndex) => {
          const diffIdx = activeDiffIndices.indexOf(lineIndex);
          if (diffIdx !== -1) {
            setCurrentDiffIndex(diffIdx);
          }
        }}
      />

      {/* JetBrains Status Bar */}
      <StatusBar
        currentChunk={currentChunk}
        activeRedactionsCount={activeRedactionsCount}
      />

      {/* Modals & Dialogs */}
      <RedactionModal
        isOpen={isRedactionModalOpen}
        onClose={() => {
          setIsRedactionModalOpen(false);
          setEditingRedaction(null);
          setRedactionAnchor(null);
        }}
        redactionItem={editingRedaction}
        anchor={redactionAnchor}
        onSave={handleSaveRedaction}
      />

      <ChunksDrawer
        isOpen={isChunksDrawerOpen}
        onClose={() => setIsChunksDrawerOpen(false)}
        chunks={chunks}
        activeChunkId={activeChunkId}
        onSelectChunk={(id) => {
          setActiveChunkId(id);
          setCurrentDiffIndex(0);
        }}
        redactions={redactions}
      />

      <AuditReportModal
        isOpen={isAuditReportOpen}
        onClose={() => setIsAuditReportOpen(false)}
        chunks={chunks}
        redactions={redactions}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        chunks={chunks}
        currentChunk={currentChunk}
        redactions={redactions}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 right-6 z-50 bg-[#25272b] border border-[#3574f0] text-white px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs animate-bounce font-medium">
          <div className="w-2 h-2 rounded-full bg-[#3574f0]"></div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
export default App;
