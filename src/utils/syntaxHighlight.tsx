import React from 'react';

export function renderHighlightedJsonLine(text: string): React.ReactNode {
  // Regex pattern for JSON line: whitespace, "key": "value" or number or boolean
  const keyValMatch = text.match(/^(\s*)("([^"]+)")(\s*:\s*)(.*)$/);

  if (keyValMatch) {
    const [, indent, quotedKey, keyName, colonSep, restVal] = keyValMatch;
    
    // Check if restVal has a trailing comma
    const hasComma = restVal.endsWith(',');
    const valWithoutComma = hasComma ? restVal.slice(0, -1).trim() : restVal.trim();
    
    return (
      <span className="whitespace-pre">
        <span>{indent}</span>
        <span className="text-[#9876aa]">{quotedKey}</span>
        <span className="text-[#bcbec4]">{colonSep}</span>
        {renderJsonValue(valWithoutComma)}
        {hasComma && <span className="text-[#bcbec4]">,</span>}
      </span>
    );
  }

  // Bracket or braces line
  return <span className="text-[#bcbec4] whitespace-pre">{text}</span>;
}

function renderJsonValue(val: string): React.ReactNode {
  if (val.startsWith('"') && val.endsWith('"')) {
    const inner = val.slice(1, -1);
    if (inner.includes('████')) {
      return (
        <span className="bg-[#482327]/80 text-[#f87171] px-1 h-[18px] leading-none rounded font-mono border border-[#84383e]/80 inline-flex items-center align-middle tracking-wider">
          {val}
        </span>
      );
    }
    return <span className="text-[#6aab73]">{val}</span>;
  }

  if (val === 'true' || val === 'false' || val === 'null') {
    return <span className="text-[#cc7832] font-semibold">{val}</span>;
  }

  if (!isNaN(Number(val))) {
    return <span className="text-[#2aacb8]">{val}</span>;
  }

  return <span className="text-[#bcbec4]">{val}</span>;
}
