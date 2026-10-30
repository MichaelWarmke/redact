import React from 'react';
import { DocumentChunk } from '../types';
import { GitBranch, Shield, HardDrive, Check, Bell } from 'lucide-react';

interface StatusBarProps {
  currentChunk: DocumentChunk;
  activeRedactionsCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentChunk,
  activeRedactionsCount,
}) => {
  return (
    <div className="h-6 bg-[#2b2d30] border-t border-[#393b40] px-3 flex items-center justify-between text-[11px] text-[#707278] select-none font-sans">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-gray-300">
          <GitBranch className="w-3 h-3 text-[#3574f0]" />
          <span>proposal/declass-package-v1</span>
        </div>

        <span className="text-[#393b40]">|</span>

        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-gray-300 font-mono">
            Chunk {currentChunk.chunkIndex}/16
          </span>
          <span className="text-[#a1a3ab]">
            ({currentChunk.subsystemCategory})
          </span>
        </div>

        <span className="text-[#393b40]">|</span>

        <div className="flex items-center gap-1 text-red-400 font-mono">
          <Shield className="w-3 h-3" />
          <span>{activeRedactionsCount} Redacted Tokens</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 font-mono text-[10px]">
        <span className="text-gray-400">Lines {currentChunk.startLine}–{currentChunk.endLine} (of 10,240)</span>
        <span className="text-gray-400">UTF-8</span>
        <span className="text-gray-400">JSON</span>
        <span className="text-gray-400">2 spaces</span>
        <span className="text-gray-400">LF</span>
        <div className="flex items-center gap-1 text-emerald-400">
          <Check className="w-3 h-3" />
          <span>IL6 OpSec Mode: Enforced</span>
        </div>
        <Bell className="w-3 h-3 text-gray-500 hover:text-white cursor-pointer" />
      </div>
    </div>
  );
};
