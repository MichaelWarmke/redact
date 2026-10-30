import React, { useState } from 'react';
import { RedactionItem, DocumentChunk } from '../types';
import { REDACTION_DEFINITIONS } from '../data/mockAircraftData';
import { Tooltip } from './Tooltip';
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Terminal,
  RotateCcw,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

interface BottomDockProps {
  currentChunk: DocumentChunk;
  redactions: RedactionItem[];
  onRevertRedaction: (id: string) => void;
  onEditRedaction: (item: RedactionItem, e?: React.MouseEvent) => void;
  onJumpToLine: (lineIndex: number) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentChunk,
  redactions,
  onRevertRedaction,
  onEditRedaction,
  onJumpToLine,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'redactions' | 'rules' | 'terminal'>('redactions');
  const [filterCode, setFilterCode] = useState<string>('ALL');

  const chunkRedactions = redactions.filter(
    (r) => r.chunkId === currentChunk.id && r.isApplied
  );

  const filteredRedactions =
    filterCode === 'ALL'
      ? chunkRedactions
      : chunkRedactions.filter((r) => r.code === filterCode);

  return (
    <div className="bg-[#25272b] border-t border-[#393b40] flex flex-col text-xs select-none">
      {/* Dock Header Tabs */}
      <div className="h-8 bg-[#2b2d30] border-b border-[#393b40] px-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('redactions');
              setIsExpanded(true);
            }}
            className={`px-3 py-1 rounded-t text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'redactions' && isExpanded
                ? 'bg-[#1e1f22] text-white border-t-2 border-[#3574f0]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Redaction Audit Registry</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-red-950/80 text-red-300 border border-red-700/60">
              {chunkRedactions.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('rules');
              setIsExpanded(true);
            }}
            className={`px-3 py-1 rounded-t text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'rules' && isExpanded
                ? 'bg-[#1e1f22] text-white border-t-2 border-[#3574f0]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>OpSec Compliance Policies</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('terminal');
              setIsExpanded(true);
            }}
            className={`px-3 py-1 rounded-t text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'terminal' && isExpanded
                ? 'bg-[#1e1f22] text-white border-t-2 border-[#3574f0]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Declassification Pipeline Log</span>
          </button>
        </div>

        {/* Right Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#707278] font-mono">
            Chunk #{currentChunk.chunkIndex} Active
          </span>
          <Tooltip
            content={isExpanded ? 'Minimize Tool Window' : 'Expand Tool Window'}
            side="top"
          >
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label="Toggle Tool Window"
              className="p-1 rounded hover:bg-[#393b40] text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Dock Content Body */}
      {isExpanded && (
        <div className="h-44 overflow-y-auto bg-[#1e1f22] p-3 text-[#bcbec4]">
          {activeTab === 'redactions' && (
            <div className="space-y-2">
              {/* Filter controls */}
              <div className="flex items-center justify-between pb-2 border-b border-[#2b2d30]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#707278] uppercase font-mono">
                    Filter by Code:
                  </span>
                  <select
                    value={filterCode}
                    onChange={(e) => setFilterCode(e.target.value)}
                    className="bg-[#25272b] border border-[#393b40] rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">
                      All Redaction Codes ({chunkRedactions.length})
                    </option>
                    {Object.keys(REDACTION_DEFINITIONS).map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-[11px] text-[#707278]">
                  Click any entry to jump directly to code line in diff viewer
                </div>
              </div>

              {filteredRedactions.length === 0 ? (
                <div className="py-6 text-center text-[#707278]">
                  No redaction directives matching criteria for this chunk.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead>
                    <tr className="text-[#707278] border-b border-[#2b2d30] text-[10px] uppercase">
                      <th className="py-1 px-2">Line</th>
                      <th className="py-1 px-2">JSON Key Path</th>
                      <th className="py-1 px-2">Directive Code</th>
                      <th className="py-1 px-2">Reviewer & Agency</th>
                      <th className="py-1 px-2">Justification / Rationale</th>
                      <th className="py-1 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRedactions.map((item) => {
                      const def =
                        REDACTION_DEFINITIONS[item.code] ||
                        REDACTION_DEFINITIONS.CUSTOM;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => onJumpToLine(item.lineIndex)}
                          className="hover:bg-[#2b2d30]/70 cursor-pointer border-b border-[#2b2d30]/40 transition-colors group"
                        >
                          <td className="py-1.5 px-2 text-[#3574f0] font-bold">
                            L{item.globalLineNumber}
                          </td>
                          <td className="py-1.5 px-2 text-[#bcbec4] font-medium">
                            {item.jsonPath}
                          </td>
                          <td className="py-1.5 px-2">
                            <span className="font-semibold px-1.5 py-0.5 rounded bg-red-950/70 border border-red-700/60 text-red-300 text-[10px]">
                              {item.code}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-[#a1a3ab] font-sans">
                            {item.reviewer}
                          </td>
                          <td className="py-1.5 px-2 text-[#707278] font-sans truncate max-w-xs">
                            {item.justification || def.description}
                          </td>
                          <td
                            className="py-1.5 px-2 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5 font-sans">
                              <Tooltip content="Edit Redaction Code & Notes" side="top">
                                <button
                                  onClick={(e) => onEditRedaction(item, e)}
                                  aria-label="Edit Redaction"
                                  className="p-1 rounded bg-[#313438] hover:bg-[#393b40] text-gray-200 hover:text-white transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>
                              <Tooltip content="Revert Redaction (Undo)" side="top">
                                <button
                                  onClick={() => onRevertRedaction(item.id)}
                                  aria-label="Revert Redaction"
                                  className="p-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 hover:text-white transition-colors"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="grid grid-cols-3 gap-3">
              {Object.values(REDACTION_DEFINITIONS)
                .slice(0, 6)
                .map((def) => (
                  <div
                    key={def.code}
                    className="p-2.5 rounded bg-[#25272b] border border-[#393b40]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-white">
                        {def.code}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-gray-300 border border-white/10">
                        {def.classificationLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a1a3ab] line-clamp-2">
                      {def.description}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="font-mono text-[11px] text-gray-400 space-y-1">
              <div className="text-emerald-400">
                [09:12:00] Initialized Aircraft Component Manifest Declassification
                Engine v4.2
              </div>
              <div>
                [09:12:02] Loaded 10,240 lines from manifest:
                F35_BLOCK4_SUBSYSTEM_MANIFEST.json
              </div>
              <div>
                [09:12:05] Partitioned into 16 discrete review chunks (640 lines /
                chunk)
              </div>
              <div>
                [09:14:22] Audit Event: Redaction applied to parts[0].serial_number
                (Code: CUI-SP-PRVCY)
              </div>
              <div>
                [09:18:05] Audit Event: Redaction applied to
                parts[0].operating_band_or_frequency (Code: IL6-OPSEC-01)
              </div>
              <div>
                [09:25:40] Audit Event: Redaction applied to
                parts[0].firmware_crypt_hash (Code: NOFORN-REL-USA)
              </div>
              <div className="text-[#3574f0]">
                [READY] Awaiting reviewer input on active chunk #
                {currentChunk.chunkIndex}...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
