import React from 'react';
import { DocumentChunk, RedactionItem } from '../types';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  Layers,
  ArrowRight,
  X,
  FileCode2,
  CheckCheck
} from 'lucide-react';

interface ChunksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chunks: DocumentChunk[];
  activeChunkId: string;
  onSelectChunk: (chunkId: string) => void;
  redactions: RedactionItem[];
}

export const ChunksDrawer: React.FC<ChunksDrawerProps> = ({
  isOpen,
  onClose,
  chunks,
  activeChunkId,
  onSelectChunk,
  redactions,
}) => {
  if (!isOpen) return null;

  const totalLines = 10240;
  const approvedChunks = chunks.filter(c => c.status === 'REDACTED_APPROVED').length;
  const inReviewChunks = chunks.filter(c => c.status === 'IN_REVIEW').length;
  const requiresRecheckChunks = chunks.filter(c => c.status === 'REQUIRES_RECHECK').length;
  const pendingChunks = chunks.filter(c => c.status === 'PENDING_REVIEW').length;

  const progressPercent = Math.round((approvedChunks / chunks.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#222428] border border-[#4e5157] rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-[#2b2d30] border-b border-[#393b40] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#3574f0]/20 border border-[#3574f0]/40 text-[#3574f0]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Manifest Partition Manager
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1e1f22] text-amber-300 border border-[#393b40]">
                  16 Review Chunks
                </span>
              </h2>
              <p className="text-xs text-[#a1a3ab]">
                Airframe File: <code className="font-mono text-gray-300">F35_BLOCK4_SUBSYSTEM_MANIFEST.json</code> (10,240 Total Lines, 320 Defense Components)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#393b40] text-[#707278] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Overview Metrics Strip */}
        <div className="px-6 py-3 bg-[#1e1f22] border-b border-[#393b40] grid grid-cols-5 gap-4">
          <div className="p-2.5 rounded bg-[#25272b] border border-[#393b40]">
            <div className="text-[10px] text-[#707278] uppercase font-mono">Total Document Volume</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">10,240 Lines</div>
            <div className="text-[10px] text-[#707278]">640 lines / chunk target</div>
          </div>
          
          <div className="p-2.5 rounded bg-[#25272b] border border-[#393b40]">
            <div className="text-[10px] text-[#707278] uppercase font-mono">Review Completion</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{progressPercent}% Sealed</div>
            <div className="w-full bg-[#1e1f22] h-1.5 rounded-full mt-1.5 overflow-hidden border border-white/5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#25272b] border border-[#393b40]">
            <div className="text-[10px] text-[#707278] uppercase font-mono">Total Active Redactions</div>
            <div className="text-sm font-bold text-red-400 font-mono mt-0.5">{redactions.length} Directives</div>
            <div className="text-[10px] text-[#707278]">Across all loaded sections</div>
          </div>

          <div className="p-2.5 rounded bg-[#25272b] border border-[#393b40]">
            <div className="text-[10px] text-[#707278] uppercase font-mono">Chunks Status</div>
            <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
              {approvedChunks} Clear · {inReviewChunks} Active · {pendingChunks} Queued
            </div>
            <div className="text-[10px] text-[#707278]">Assigned to 5 Reviewers</div>
          </div>

          <div className="p-2.5 rounded bg-[#25272b] border border-[#393b40]">
            <div className="text-[10px] text-[#707278] uppercase font-mono">Classification Level</div>
            <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">SECRET // NOFORN</div>
            <div className="text-[10px] text-[#707278]">DoD IL6 OpSec Mandate</div>
          </div>
        </div>

        {/* Chunks List Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {chunks.map((chunk) => {
            const isActive = chunk.id === activeChunkId;
            const chunkRedactions = redactions.filter(r => r.chunkId === chunk.id && r.isApplied);

            return (
              <div
                key={chunk.id}
                onClick={() => {
                  onSelectChunk(chunk.id);
                  onClose();
                }}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                  isActive
                    ? 'bg-[#28354f] border-[#3574f0] shadow-md ring-1 ring-[#3574f0]'
                    : 'bg-[#25272b] border-[#393b40] hover:border-[#4e5157] hover:bg-[#2b2d30]'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Chunk index pill */}
                  <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-mono font-bold ${
                    isActive
                      ? 'bg-[#3574f0] text-white shadow-sm'
                      : 'bg-[#1e1f22] text-[#bcbec4] border border-[#393b40]'
                  }`}>
                    <span className="text-[10px] uppercase font-sans text-white/70">Chunk</span>
                    <span className="text-sm leading-none">{String(chunk.chunkIndex).padStart(2, '0')}</span>
                  </div>

                  {/* Title and metadata */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm group-hover:text-[#3574f0] transition-colors">
                        {chunk.title}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1e1f22] text-[#a1a3ab] border border-[#393b40]">
                        {chunk.subsystemCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-[11px] text-[#707278] font-mono">
                      <span>Lines {chunk.startLine.toLocaleString()} – {chunk.endLine.toLocaleString()} (640 lines)</span>
                      <span>•</span>
                      <span>{chunk.partCount} Components</span>
                      <span>•</span>
                      <span>Lead: <span className="text-gray-300 font-sans">{chunk.assignedReviewer}</span></span>
                    </div>
                  </div>
                </div>

                {/* Right side: Status and Redaction Count */}
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="font-mono text-xs font-semibold text-white">
                      {chunkRedactions.length > 0 ? (
                        <span className="text-red-400">{chunkRedactions.length} Redactions Applied</span>
                      ) : (
                        <span className="text-gray-400">0 Redactions</span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#707278]">
                      {chunkRedactions.length > 0 ? 'IL6 / ITAR / CUI Protected' : 'Clean / Unrestricted'}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {chunk.status === 'REDACTED_APPROVED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 font-medium">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Approved
                      </span>
                    )}
                    {chunk.status === 'IN_REVIEW' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-950/70 border border-blue-700/60 text-blue-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        In Review
                      </span>
                    )}
                    {chunk.status === 'REQUIRES_RECHECK' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-700/60 text-amber-300 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Needs Recheck
                      </span>
                    )}
                    {chunk.status === 'PENDING_REVIEW' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-medium">
                        <Clock className="w-3.5 h-3.5 opacity-50" />
                        Queued
                      </span>
                    )}
                  </div>

                  {/* Action arrow */}
                  <div className={`p-1.5 rounded ${
                    isActive ? 'text-[#3574f0]' : 'text-[#707278] group-hover:text-white'
                  }`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#2b2d30] border-t border-[#393b40] flex items-center justify-between text-[#707278]">
          <span>
            Selecting a chunk loads its isolated 640-line comparison sandbox into the JetBrains diff viewer.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#313438] hover:bg-[#393b40] text-white transition-colors"
          >
            Close Partition View
          </button>
        </div>
      </div>
    </div>
  );
};
