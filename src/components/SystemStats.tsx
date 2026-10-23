import React, { useState, useEffect } from 'react';
import { Shield, Zap, Server, HardDrive, Cpu, Wifi } from 'lucide-react';
import { CompilerMetrics, CompilerLog } from '../types';

interface SystemStatsProps {
  metrics: CompilerMetrics;
  logs: CompilerLog[];
}

export default function SystemStats({ metrics, logs }: SystemStatsProps) {
  const [cpuHistory, setCpuHistory] = useState<number[]>(() => {
    // Fill initial values
    return Array.from({ length: 24 }, (_, i) => 20 + Math.sin(i / 2) * 8 + Math.random() * 5);
  });

  const [ramHistory, setRamHistory] = useState<number[]>(() => {
    return Array.from({ length: 24 }, (_, i) => 40 + Math.cos(i / 3) * 5 + Math.random() * 3);
  });

  // Update history arrays if compiled or running
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuHistory((prev) => {
        let nextVal = 0;
        if (metrics.status === 'compiling') {
          nextVal = 75 + Math.random() * 15;
        } else if (metrics.status === 'success') {
          nextVal = 10 + Math.random() * 5;
        } else {
          nextVal = 20 + Math.random() * 8;
        }
        const next = [...prev.slice(1), nextVal];
        return next;
      });

      setRamHistory((prev) => {
        let nextVal = 0;
        if (metrics.status === 'compiling') {
          nextVal = 62 + Math.random() * 10;
        } else if (metrics.status === 'success') {
          nextVal = 51 + Math.random() * 3;
        } else {
          nextVal = 44 + Math.random() * 4;
        }
        const next = [...prev.slice(1), nextVal];
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [metrics.status]);

  // Convert histories into SVG path strings
  const generateSvgPath = (data: number[], maxVal: number) => {
    if (data.length === 0) return '';
    const width = 360;
    const height = 60;
    const xStep = width / (data.length - 1);

    return data
      .map((val, index) => {
        const x = index * xStep;
        const normalizedVal = (val / maxVal) * height;
        const y = height - normalizedVal;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const cpuPath = generateSvgPath(cpuHistory, 100);
  const ramPath = generateSvgPath(ramHistory, 100);

  // Get log message summary values
  const totalWarnings = logs.filter(l => l.type === 'warning').length;
  const totalErrors = logs.filter(l => l.type === 'error').length;

  return (
    <div className="flex flex-col gap-6" id="system-stats-panel">
      {/* Network & Live Tunnel Header */}
      <div className="bg-[#111] p-4 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className={`relative flex h-3 w-3`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${metrics.status === 'compiling' ? 'bg-amber-400' : metrics.status === 'error' ? 'bg-red-500' : 'bg-green-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${metrics.status === 'compiling' ? 'bg-amber-500' : metrics.status === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></span>
            </span>
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-[#666]">TUNNEL_SECURITY</div>
            <div className="text-sm font-semibold tracking-tight">SSL_ENC_ACTIVE</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-mono text-[#555]">LATENCY</div>
          <div className="text-sm font-mono text-white tracking-wider">{metrics.latencyMs} MS</div>
        </div>
      </div>

      {/* Memory Allocator readout */}
      <div className="block border border-white/10 p-5 bg-[#0a0a0a]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs uppercase font-mono text-zinc-400 flex items-center gap-1.5">
            <Server size={12} className="text-blue-500" />
            VIRTUAL HEAP MEMORY
          </span>
          <span className="text-[10px] font-mono text-blue-400">HEAP: ACTIVE</span>
        </div>
        <div className="text-2xl font-black font-mono tracking-wider text-white mb-2">
          {metrics.ramUsageMb.toFixed(1)} <span className="text-xs text-zinc-500">MB ALLOCATED</span>
        </div>
        <div className="w-full bg-[#222] h-2 mb-2">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(metrics.ramUsageMb / 1024) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between font-mono text-[9px] text-[#555]">
          <span>0MB MIN</span>
          <span>512MB COMMITTED</span>
          <span>1024MB MAX</span>
        </div>
      </div>

      {/* Active Load Waveforms */}
      <div className="border border-white/10 p-5 bg-[#111] flex flex-col gap-5">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs uppercase font-mono text-zinc-300 flex items-center gap-1.5">
              <Cpu size={12} className="text-emerald-500" />
              PROCESSOR CORES
            </span>
            <span className="text-xs font-mono text-white">{cpuHistory[cpuHistory.length - 1].toFixed(0)}% Util</span>
          </div>
          <div className="w-full h-15 bg-[#0d0d0d] relative overflow-hidden border border-white/5 py-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 360 60" preserveAspectRatio="none">
              {/* Reference Gridlines */}
              <line x1="0" y1="15" x2="360" y2="15" stroke="#222" strokeDasharray="2,2" />
              <line x1="0" y1="30" x2="360" y2="30" stroke="#222" strokeDasharray="2,2" />
              <line x1="0" y1="45" x2="360" y2="45" stroke="#222" strokeDasharray="2,2" />
              {/* Live line */}
              <path
                d={cpuPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs uppercase font-mono text-zinc-300 flex items-center gap-1.5">
              <HardDrive size={12} className="text-blue-500" />
              DISK SPEEDWAY (WRITE LOAD)
            </span>
            <span className="text-xs font-mono text-white">{ramHistory[ramHistory.length - 1].toFixed(0)} MB/s</span>
          </div>
          <div className="w-full h-15 bg-[#0d0d0d] relative overflow-hidden border border-white/5 py-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 360 60" preserveAspectRatio="none">
              {/* Reference Gridlines */}
              <line x1="0" y1="15" x2="360" y2="15" stroke="#222" strokeDasharray="2,2" />
              <line x1="0" y1="30" x2="360" y2="30" stroke="#222" strokeDasharray="2,2" />
              <line x1="0" y1="45" x2="360" y2="45" stroke="#222" strokeDasharray="2,2" />
              {/* Live line */}
              <path
                d={ramPath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Build Diagnostical Checklist */}
      <div className="bg-[#111] p-5 border border-white/5">
        <h3 className="text-xs uppercase font-mono text-zinc-400 tracking-wider mb-3">WORKSPACE SANITY CHECKS</h3>
        <ul className="space-y-2.5 font-mono text-xs">
          <li className="flex items-center justify-between">
            <span className="text-zinc-500">ESLint Verification:</span>
            <span className={metrics.status === 'success' ? 'text-green-400' : 'text-zinc-400'}>
              {metrics.status === 'success' ? '✔ STABLE' : 'PENDING'}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-zinc-500">Transpile Optimizer:</span>
            <span className={metrics.status === 'success' ? 'text-green-400' : 'text-zinc-400'}>
              {metrics.status === 'success' ? '✔ MINIFIED' : 'PENDING'}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-zinc-500">Type Integrity Checking:</span>
            <span className={metrics.status === 'success' ? 'text-green-400' : 'text-zinc-400'}>
              {metrics.status === 'success' ? '✔ VERIFIED' : 'PENDING'}
            </span>
          </li>
          <li className="flex items-center justify-between border-t border-white/5 pt-2 mt-2">
            <span className="text-zinc-500">Build Warnings:</span>
            <span className={totalWarnings > 0 ? 'text-amber-500 font-bold' : 'text-zinc-400'}>
              {totalWarnings}
            </span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-zinc-500">Build Errors:</span>
            <span className={totalErrors > 0 ? 'text-red-500 font-bold' : 'text-zinc-400'}>
              {totalErrors}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
