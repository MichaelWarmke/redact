import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Columns,
  Layers,
  Search,
  CheckCircle2,
  FileDown,
  FileText,
  SlidersHorizontal,
  FolderGit2,
  RefreshCw,
} from 'lucide-react';
import { DocumentChunk } from '../types';
import { Tooltip } from './Tooltip';

interface ToolbarProps {
  currentChunk: DocumentChunk;
  totalChunks: number;
  currentDiffIndex: number;
  totalDiffs: number;
  syncScroll: boolean;
  onToggleSyncScroll: () => void;
  onPrevDiff: () => void;
  onNextDiff: () => void;
  onOpenChunksDrawer: () => void;
  onOpenAuditReport: () => void;
  onExportJson: () => void;
  onApproveChunk: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: 'side-by-side' | 'unified';
  onToggleViewMode: (mode: 'side-by-side' | 'unified') => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentChunk,
  totalChunks,
  currentDiffIndex,
  totalDiffs,
  syncScroll,
  onToggleSyncScroll,
  onPrevDiff,
  onNextDiff,
  onOpenChunksDrawer,
  onOpenAuditReport,
  onExportJson,
  onApproveChunk,
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <div className="h-11 bg-[#2b2d30] border-b border-[#393b40] px-3 flex items-center justify-between text-xs select-none">
      {/* Left Section: Breadcrumb & Chunk Indicator */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-gray-300 font-medium">
          <FileText className="w-4 h-4 text-[#3574f0]" />
          <span className="font-mono text-white text-[13px]">
            F35_BLOCK4_SUBSYSTEM_MANIFEST.json
          </span>
          <span className="text-[#707278] text-[11px] font-mono">
            (10,240 lines)
          </span>
        </div>

        <span className="text-[#4e5157]">/</span>

        {/* Chunk selector trigger */}
        <Tooltip content="Open 10,000-Line Manifest Partition Manager (Switch Chunks)">
          <button
            onClick={onOpenChunksDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1e1f22] hover:bg-[#313438] border border-[#393b40] text-gray-200 transition-colors group"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-amber-300">
              Chunk {String(currentChunk.chunkIndex).padStart(2, '0')}/{totalChunks}
            </span>
            <span className="text-[#a1a3ab] max-w-[180px] truncate">
              {currentChunk.title}
            </span>
            <span className="font-mono text-[10px] text-[#707278]">
              [{currentChunk.startLine.toLocaleString()}–{currentChunk.endLine.toLocaleString()}]
            </span>
            <ChevronDown className="w-3 h-3 text-[#707278] group-hover:text-white" />
          </button>
        </Tooltip>
      </div>

      {/* Middle Section: JetBrains Icon-Only Diff Navigation & Controls */}
      <div className="flex items-center gap-1.5">
        {/* Diff Jump Controls */}
        <div className="flex items-center bg-[#1e1f22] border border-[#393b40] rounded px-1 py-0.5">
          <Tooltip content="Previous Difference" shortcut="Shift+F7">
            <button
              onClick={onPrevDiff}
              disabled={totalDiffs === 0}
              aria-label="Previous Difference"
              className="p-1.5 rounded hover:bg-[#313438] text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronUp className="w-4 h-4 text-[#3574f0]" />
            </button>
          </Tooltip>

          <div className="px-2 font-mono text-[11px] text-[#bcbec4]">
            {totalDiffs > 0 ? (
              <span>
                <strong className="text-white">{currentDiffIndex + 1}</strong>/{totalDiffs}
              </span>
            ) : (
              <span className="text-[#707278]">0/0</span>
            )}
          </div>

          <Tooltip content="Next Difference" shortcut="F7">
            <button
              onClick={onNextDiff}
              disabled={totalDiffs === 0}
              aria-label="Next Difference"
              className="p-1.5 rounded hover:bg-[#313438] text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-[#3574f0]" />
            </button>
          </Tooltip>
        </div>

        <div className="h-4 w-[1px] bg-[#393b40] mx-0.5" />

        {/* Sync Scroll Toggle (Icon-only) */}
        <Tooltip
          content={
            syncScroll
              ? 'Synchronize Scrolling (Active)'
              : 'Synchronize Scrolling (Disabled)'
          }
        >
          <button
            onClick={onToggleSyncScroll}
            aria-label="Synchronize Scrolling"
            className={`p-1.5 rounded border transition-colors ${
              syncScroll
                ? 'bg-[#25324d] border-[#3574f0] text-blue-300'
                : 'bg-[#1e1f22] border-[#393b40] text-gray-400 hover:text-gray-200 hover:bg-[#313438]'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* View Mode Toggle (Icon-only) */}
        <div className="flex items-center bg-[#1e1f22] border border-[#393b40] rounded p-0.5 gap-0.5">
          <Tooltip content="Side-by-Side Viewer">
            <button
              onClick={() => onToggleViewMode('side-by-side')}
              aria-label="Side-by-Side Viewer"
              className={`p-1 rounded transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-[#313438] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#2b2d30]'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content="Unified Diff Viewer">
            <button
              onClick={() => onToggleViewMode('unified')}
              aria-label="Unified Diff Viewer"
              className={`p-1 rounded transition-colors ${
                viewMode === 'unified'
                  ? 'bg-[#313438] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#2b2d30]'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        <div className="h-4 w-[1px] bg-[#393b40] mx-0.5" />

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#707278]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search JSON..."
            className="w-36 focus:w-48 transition-all bg-[#1e1f22] border border-[#393b40] rounded pl-7 pr-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#3574f0]"
          />
        </div>
      </div>

      {/* Right Section: Icon-Only Proposal & Reviewer Actions */}
      <div className="flex items-center gap-1.5">
        <Tooltip content="Redaction Audit Log & Compliance Memo">
          <button
            onClick={onOpenAuditReport}
            aria-label="Audit Log"
            className="p-1.5 rounded bg-[#1e1f22] hover:bg-[#313438] border border-[#393b40] text-purple-400 hover:text-purple-300 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Export Sanitized Redacted JSON">
          <button
            onClick={onExportJson}
            aria-label="Export Redacted JSON"
            className="p-1.5 rounded bg-[#1e1f22] hover:bg-[#313438] border border-[#393b40] text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FileDown className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Approve & Seal Chunk for Proposal">
          <button
            onClick={onApproveChunk}
            aria-label="Approve Chunk"
            className="p-1.5 rounded bg-[#1f402c] hover:bg-[#255237] border border-[#356e4e] text-emerald-300 hover:text-emerald-200 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
