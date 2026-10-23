import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Copy, Trash2, Search, SlidersHorizontal, Check } from 'lucide-react';
import { CompilerLog } from '../types';

interface CompilerTerminalProps {
  logs: CompilerLog[];
  onClearLogs: () => void;
}

export default function CompilerTerminal({ logs, onClearLogs }: CompilerTerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [filterType, setFilterType] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Scroll terminal to the bottom whenever logs change
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterType === 'all' || log.type === filterType;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.time.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const getLogColorClass = (type: CompilerLog['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-400 font-medium';
      case 'warning': return 'text-amber-400 font-medium';
      case 'error': return 'text-red-500 font-semibold uppercase tracking-wider';
      default: return 'text-zinc-300';
    }
  };

  const getBadgeStyle = (type: CompilerLog['type']) => {
    switch (type) {
      case 'success': return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50';
      case 'warning': return 'bg-amber-950/40 text-amber-400 border-amber-900/50';
      case 'error': return 'bg-red-950/40 text-red-400 border-red-900/50';
      default: return 'bg-zinc-900 text-zinc-400 border-zinc-800';
    }
  };

  const handleCopyLogs = () => {
    const logText = logs.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-[#080808] border border-white/10" id="compiler-terminal-container">
      {/* Terminal Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 px-5 py-3 gap-3">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-zinc-500 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-zinc-400">COMPILER_STDOUT_CONSOLE</span>
          <span className="bg-[#222] text-[9px] font-mono font-bold px-2 py-0.5 rounded text-zinc-400">
            {logs.length} LOGS
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter options */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-[#111] text-xs font-mono border border-zinc-800 px-3 py-1 text-zinc-400 outline-none focus:border-white/25 rounded-none"
          >
            <option value="all">ALL LEVELS</option>
            <option value="info">INFO</option>
            <option value="success">SUCCESS</option>
            <option value="warning">WARNINGS</option>
            <option value="error">ERRORS</option>
          </select>

          {/* Copy logs */}
          <button
            onClick={handleCopyLogs}
            className="p-1 px-2 hover:bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all font-mono text-[10px] flex items-center gap-1"
            title="Copy entire stdout console"
            id="copy-terminal-logs-btn"
          >
            {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
            {copied ? 'COPIED!' : 'COPY'}
          </button>

          {/* Clear logs */}
          <button
            onClick={onClearLogs}
            className="p-1 px-2 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/50 text-zinc-500 hover:text-red-400 transition-all font-mono text-[10px] flex items-center gap-1"
            title="Wipe terminal buffer"
            id="clear-terminal-logs-btn"
          >
            <Trash2 size={11} />
            CLEAR
          </button>
        </div>
      </div>

      {/* Internal Search Buffer Header */}
      <div className="bg-zinc-950 border-b border-white/5 py-1.5 px-5 flex items-center gap-2.5">
        <Search size={12} className="text-zinc-600" />
        <input
          type="text"
          placeholder="SEARCH CONSOLE BUFFER..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-[11px] font-mono text-zinc-400 focus:outline-none w-full tracking-wider"
          id="terminal-search-field"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-[10px] font-mono text-[#555] hover:text-zinc-300"
          >
            CLEAR_FILTER
          </button>
        )}
      </div>

      {/* Terminal stdout output screen */}
      <div className="h-68 overflow-y-auto p-5 font-mono text-xs leading-relaxed space-y-2 text-zinc-400 select-text scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredLogs.length === 0 ? (
          <div className="text-zinc-600 py-4 italic text-center text-[11px]">
            {searchQuery ? '--- NO BUFFER LOG RECORDS MATCH QUERY ---' : '--- CONSOLE BUFFER CLEARED ---'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 hover:bg-white/[0.02] py-0.5 px-1 rounded transition-colors group">
              <span className="text-zinc-700 text-[10px] select-none pt-0.5 shrink-0 block w-18">{log.time}</span>
              <span className={`text-[9px] uppercase tracking-wider font-bold border px-1 py-0.2 select-none shrink-0 rounded ${getBadgeStyle(log.type)}`}>
                {log.type}
              </span>
              <span className={`break-all whitespace-pre-wrap ${getLogColorClass(log.type)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* System output terminal footer parameters */}
      <div className="flex justify-between items-center bg-zinc-950 text-[10px] font-mono text-[#555] p-2.5 px-5 border-t border-white/5">
        <span>MODE: STREAMING_ACTIVE_STDOUT</span>
        <span>ENCODING: UTF-8</span>
        <span>LINE_INDEX: {filteredLogs.length} OF {logs.length} BUFFER_LINES</span>
      </div>
    </div>
  );
}
