import React from 'react';
import { RedactionItem, DocumentChunk } from '../types';
import { REDACTION_DEFINITIONS } from '../data/mockAircraftData';
import { ShieldCheck, X, FileText, Download, CheckCircle, Printer, Lock } from 'lucide-react';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chunks: DocumentChunk[];
  redactions: RedactionItem[];
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  chunks,
  redactions,
}) => {
  if (!isOpen) return null;

  const appliedRedactions = redactions.filter(r => r.isApplied);

  // Group counts by code
  const codeCounts: Record<string, number> = {};
  appliedRedactions.forEach((r) => {
    codeCounts[r.code] = (codeCounts[r.code] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#222428] border border-[#4e5157] rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs text-[#bcbec4]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#2b2d30] border-b border-[#393b40] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-purple-950/70 border border-purple-700/60 text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Declassification Audit Memo & Compliance Summary
              </h2>
              <p className="text-xs text-[#a1a3ab]">
                Official Certificate of Review for Project Proposal Manifest
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 select-text">
          {/* Certificate Banner */}
          <div className="p-4 rounded-lg bg-[#1e1f22] border border-[#393b40] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#707278] uppercase">Proposal Artifact Target</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                F35_BLOCK4_SUBSYSTEM_MANIFEST.json
              </div>
              <div className="text-xs text-[#a1a3ab] mt-1">
                Total File Lines: <span className="font-mono text-white">10,240</span> · Independent Review Batches: <span className="font-mono text-white">16 Chunks</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 font-bold text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                IL6 OpSec Validated
              </span>
              <div className="text-[10px] text-[#707278] mt-1 font-mono">
                Audit Hash: SHA256-8F2B9...C921
              </div>
            </div>
          </div>

          {/* Breakdown by Regulation Code */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Redactions Breakdown by Regulatory Authority
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(codeCounts).map(([code, count]) => {
                const def = REDACTION_DEFINITIONS[code] || REDACTION_DEFINITIONS.CUSTOM;
                return (
                  <div key={code} className="p-3 rounded bg-[#1e1f22] border border-[#393b40] flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{code}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-gray-300 border border-white/10">
                          {def.classificationLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#707278] mt-1 leading-snug">
                        {def.description}
                      </p>
                    </div>
                    <div className="text-right pl-4">
                      <div className="font-mono text-base font-bold text-red-400">{count}</div>
                      <div className="text-[10px] text-[#707278]">tokens</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Redactions Audit Register */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Applied Redaction Directives Register ({appliedRedactions.length})
            </h3>
            <div className="border border-[#393b40] rounded-lg overflow-hidden bg-[#1e1f22]">
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead>
                  <tr className="bg-[#25272b] text-[#707278] border-b border-[#393b40] text-[10px] uppercase">
                    <th className="py-2 px-3">Chunk</th>
                    <th className="py-2 px-3">Line #</th>
                    <th className="py-2 px-3">Target Field</th>
                    <th className="py-2 px-3">Reason Code</th>
                    <th className="py-2 px-3">Reviewer Justification</th>
                    <th className="py-2 px-3">Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2b2d30]">
                  {appliedRedactions.map((item) => (
                    <tr key={item.id} className="hover:bg-[#2b2d30]/50">
                      <td className="py-2 px-3 font-semibold text-amber-300">
                        {item.chunkId.replace('chunk-', 'Chunk ')}
                      </td>
                      <td className="py-2 px-3 text-[#3574f0]">
                        L{item.globalLineNumber}
                      </td>
                      <td className="py-2 px-3 text-white">
                        {item.jsonPath}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-red-950/70 border border-red-700/60 text-red-300 text-[10px]">
                          {item.code}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#a1a3ab] font-sans truncate max-w-xs">
                        {item.justification || 'Standard OpSec masking'}
                      </td>
                      <td className="py-2 px-3 text-[#707278] font-sans">
                        {item.reviewer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#2b2d30] border-t border-[#393b40] flex items-center justify-between">
          <div className="text-xs text-[#707278] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Document declassification approved under DoD Directive 5230.25</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert('Audit memorandum copied to clipboard for proposal submission.');
              }}
              className="px-3 py-1.5 rounded bg-[#313438] hover:bg-[#393b40] text-white transition-colors"
            >
              Copy Summary
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#3574f0] hover:bg-[#3068d8] text-white font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
