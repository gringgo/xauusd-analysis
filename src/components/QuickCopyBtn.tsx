import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const QuickCopyBtn = ({ text, label }: { text: string | number, label?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      className="inline-flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded text-[10px] ml-1 transition-colors border border-gray-700"
      title="Salin ke MT5"
    >
      {copied ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
      {label && <span>{copied ? 'Disalin' : label}</span>}
    </button>
  );
};
