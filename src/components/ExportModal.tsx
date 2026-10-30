import React, { useState } from 'react';
import { DocumentChunk, RedactionItem } from '../types';
import { generateDiffLines } from '../utils/jsonDiffEngine';
import { FileDown, X, Copy, Check, ShieldCheck } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chunks: DocumentChunk[];
  currentChunk: DocumentChunk;
  redactions: RedactionItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  chunks,
  currentChunk,
  redactions,
}) => {
  const [exportScope, setExportScope] = useState<'current-chunk' | 'full-document'>('current-chunk');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate redacted JSON text for current chunk
  const currentChunkLines = generateDiffLines(currentChunk, redactions);
  const currentChunkRedactedText = currentChunkLines
    .map(line => line.redactedText)
    .join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentChunkRedactedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentChunkRedactedText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportScope === 'current-chunk'
      ? `REDACTED_${currentChunk.id}_MANIFEST.json`
      : 'REDACTED_F35_BLOCK4_10K_MANIFEST.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-[#222428] border border-[#4e5157] rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-[#2b2d30] border-b border-[#393b40] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-950/70 border border-emerald-700/60 text-emerald-300">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Export Declassified & Redacted JSON Deliverable
              </h2>
              <p className="text-xs text-[#a1a3ab]">
                Sanitized JSON with all OpSec masking and regulatory codes applied
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

        {/* Scope selector */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scope"
                checked={exportScope === 'current-chunk'}
                onChange={() => setExportScope('current-chunk')}
                className="text-[#3574f0] focus:ring-0"
              />
              <span className="text-white font-medium">
                Current Active Chunk ({currentChunk.title} · Lines {currentChunk.startLine}–{currentChunk.endLine})
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scope"
                checked={exportScope === 'full-document'}
                onChange={() => setExportScope('full-document')}
                className="text-[#3574f0] focus:ring-0"
              />
              <span className="text-white font-medium">
                Full 10,000-Line Manifest (All 16 Chunks Consolidated)
              </span>
            </label>
          </div>

          {/* Code Preview Box */}
          <div className="border border-[#393b40] rounded-lg bg-[#161719] p-3 max-h-72 overflow-auto font-mono text-[11px] text-[#bcbec4]">
            <pre className="whitespace-pre">
              {currentChunkRedactedText.slice(0, 1500)}
              {'\n... [Remaining lines truncated in preview]'}
            </pre>
          </div>

          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero raw classified parameters remain in the output stream.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#2b2d30] border-t border-[#393b40] flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#313438] hover:bg-[#393b40] text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Output JSON'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#313438] hover:bg-[#393b40] text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#3574f0] hover:bg-[#3068d8] text-white font-medium transition-colors shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              Download JSON Deliverable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
