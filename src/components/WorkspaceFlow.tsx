import React from 'react';
import { Play, Square, RefreshCw, Zap, Layers, Server, Sliders, ToggleLeft, ToggleRight, Loader } from 'lucide-react';
import { CompilerMetrics, BridgeConfig, WorkspaceFile } from '../types';

interface WorkspaceFlowProps {
  metrics: CompilerMetrics;
  config: BridgeConfig;
  files: WorkspaceFile[];
  onConfigChange: (newConfig: Partial<BridgeConfig>) => void;
  onExecuteCompile: () => void;
  onAbortCompile: () => void;
  onReset: () => void;
}

export default function WorkspaceFlow({
  metrics,
  config,
  files,
  onConfigChange,
  onExecuteCompile,
  onAbortCompile,
  onReset,
}: WorkspaceFlowProps) {

  const getProgressPhrase = () => {
    if (metrics.status === 'idle') return 'Ready to bridge workspace environment vectors.';
    if (metrics.status === 'success') return 'WORKSPACE LOAD SUCCESSFUL. Virtual container booted on port 3000.';
    if (metrics.status === 'error') return 'ERROR RESOLVING MEMORY PARAMS. Please check syntax integrity.';
    if (metrics.status === 'aborted') return 'COMPILATION ABORTED BY PROTOCOL INSTRUCTION.';

    // Compiling states
    if (metrics.progress < 25) return 'Establishing SSL handshakes with remote AI Studio A...';
    if (metrics.progress < 50) return 'Downloading payload bundle files and verifying hashes...';
    if (metrics.progress < 75) return 'Executing TypeScript compiler (tsc) and static analyzer...';
    if (metrics.progress < 90) return 'Applying optimization flags and assembling bundle target...';
    return 'Allocating heap memory pages and booting the target web server...';
  };

  return (
    <div className="flex flex-col gap-6" id="workspace-flow-subgrid">
      {/* Configuration Control Panel Header */}
      <div className="bg-[#111] p-5 border border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-zinc-400 flex items-center gap-2">
            <Sliders size={12} className="text-blue-500" />
            COMPILER TUNER PARAMETERS
          </span>
          <span className="text-[10px] font-mono text-zinc-500">OPTIMIZE_LEVEL_SELECTION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs font-mono">
          {/* Column 1 - Speed throughput */}
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-zinc-500 uppercase text-[10px]">Transmission Latency Preset</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="950"
                value={config.throughputMbps}
                onChange={(e) => onConfigChange({ throughputMbps: Number(e.target.value) })}
                className="w-full accent-blue-500 h-1 bg-zinc-800"
                disabled={metrics.status === 'compiling'}
                id="throughput-range-slider"
              />
              <span className="text-white font-bold w-16 text-right shrink-0">
                {config.throughputMbps} MS
              </span>
            </div>
            <span className="text-[9px] text-[#444] leading-none">Simulates network lag of the code bridge</span>
          </div>

          {/* Column 2 - Optimization Flag Selection */}
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-zinc-500 uppercase text-[10px]">Compiler level (GCC Optimization)</label>
            <div className="grid grid-cols-4 gap-1">
              {(['O0', 'O1', 'O2', 'O3'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onConfigChange({ optimizationLevel: lvl })}
                  className={`py-1 text-center font-bold border transition-all text-xs ${
                    config.optimizationLevel === lvl
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-zinc-800 bg-[#0d0d0d] text-zinc-500 hover:text-zinc-300'
                  }`}
                  disabled={metrics.status === 'compiling'}
                  id={`opt-level-btn-${lvl}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <span className="text-[9px] text-[#444] leading-none">
              {config.optimizationLevel === 'O0' && 'No optimization. Standard Debug builds.'}
              {config.optimizationLevel === 'O1' && 'Basic optimization. Resolves dead branches.'}
              {config.optimizationLevel === 'O2' && 'Medium optimization. Bundle tree-shaking.'}
              {config.optimizationLevel === 'O3' && 'Maximum size reduction. Aggressive uglifying.'}
            </span>
          </div>

          {/* Column 3 - Option Swappers */}
          <div className="md:col-span-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => onConfigChange({ minify: !config.minify })}
              className={`flex items-center justify-between p-2.5 border transition-all ${
                config.minify ? 'border-zinc-700 bg-zinc-900 text-white' : 'border-zinc-900 bg-transparent text-[#444]'
              }`}
              disabled={metrics.status === 'compiling'}
              id="toggle-minify-btn"
            >
              <span className="text-[10px]">MINIFY</span>
              {config.minify ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
            </button>

            <button
              onClick={() => onConfigChange({ lintCheck: !config.lintCheck })}
              className={`flex items-center justify-between p-2.5 border transition-all ${
                config.lintCheck ? 'border-zinc-700 bg-zinc-900 text-white' : 'border-zinc-900 bg-transparent text-[#444]'
              }`}
              disabled={metrics.status === 'compiling'}
              id="toggle-lint-btn"
            >
              <span className="text-[10px]">LINT CHECK</span>
              {config.lintCheck ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Bridge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

        {/* Source Environment */}
        <div className="md:col-span-4 bg-[#0d0d0d] border border-white/10 p-6 flex flex-col justify-between rounded-none">
          <div>
            <div className="border-b border-white/10 pb-3 mb-4">
              <span className="text-[10px] uppercase tracking-widest text-[#555] font-bold">01 / SOURCE INSTANCE</span>
              <h3 className="text-3xl font-black text-white leading-normal tracking-tight">AI_STUDIO_A</h3>
              <span className="text-[10px] font-mono text-zinc-500 break-all">{config.sourceUrl}</span>
            </div>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed font-sans">
              Contains the active working systems, custom APIs, node specifications, and templates waiting to be packaged and bridge-transported.
            </p>

            {/* Simulated file state check list */}
            <ul className="space-y-3 font-mono text-xs text-[#777]">
              <li className="flex justify-between items-center bg-zinc-900/30 p-2 border border-white/5">
                <span>NEURAL_NET_MAP</span>
                <span className="text-white font-bold">[READY_SYNC]</span>
              </li>
              <li className="flex justify-between items-center bg-zinc-900/30 p-2 border border-white/5">
                <span>ASSET_REGISTRY</span>
                <span className="text-white font-bold">[{files.length} ASSETS_MAPPED]</span>
              </li>
              <li className="flex justify-between items-center bg-zinc-900/30 p-2 border border-white/5">
                <span>Vfilesystem status</span>
                <span className="text-green-400 font-bold">[SYNCED]</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5">
            <span className="text-[10px] font-mono text-zinc-600 block uppercase">LAST_COMMIT_HASH</span>
            <span className="text-xs font-mono text-zinc-400">0xCF4B0AEE81DDF22</span>
          </div>
        </div>

        {/* Central Operations Trigger Button */}
        <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/10 relative overflow-hidden h-full">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
            <span className="text-[140px] font-black rotate-90 tracking-tighter">BUILD</span>
          </div>

          <div className="z-10 py-5 flex flex-col items-center justify-center">
            {metrics.status === 'compiling' ? (
              <div className="mb-4 relative">
                {/* Visual loading ring */}
                <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-blue-500 flex items-center justify-center">
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black font-mono tracking-tighter text-blue-500">
                    {Math.round(metrics.progress)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-[120px] font-black leading-none text-blue-600 mb-2 tracking-tighter select-none font-mono">
                {Math.round(metrics.progress)}
              </div>
            )}

            <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-500 mb-8 block">
              Compile Ratio
            </div>

            <div className="flex flex-col gap-2.5 w-full max-w-[210px]">
              {metrics.status === 'compiling' ? (
                <button
                  type="button"
                  onClick={onAbortCompile}
                  className="px-6 py-4 border border-red-500/30 bg-red-950/10 hover:bg-red-950/40 text-red-400 font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                  id="abort-compilation-btn"
                >
                  <Square size={12} fill="currentColor" />
                  Abort Compile
                </button>
              ) : metrics.status === 'success' ? (
                <button
                  type="button"
                  onClick={onReset}
                  className="px-6 py-4 border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                  id="reset-compilation-btn"
                >
                  <RefreshCw size={12} />
                  Force Recompile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onExecuteCompile}
                  className="px-8 py-4 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-widest hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
                  id="execute-compile-btn"
                >
                  <Play size={12} fill="currentColor" />
                  Execute Compile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Target Workspace */}
        <div className="md:col-span-4 bg-[#0d0d0d] border border-white/10 p-6 flex flex-col justify-between rounded-none">
          <div>
            <div className="border-b border-white/10 pb-3 mb-4">
              <span className="text-[10px] uppercase tracking-widest text-[#555] font-bold">02 / TARGET WORKSPACE</span>
              <h3 className="text-3xl font-black text-white leading-normal tracking-tight">THIS_INSTANCE</h3>
              <span className="text-[10px] font-mono text-[#555]">LOCAL_UID: {config.targetId}</span>
            </div>

            {/* Progress bar */}
            <div className="mb-4 font-mono">
              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                <span>BUFFER_LOADING_STATUS</span>
                <span>{Math.round(metrics.progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 border border-white/5">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${metrics.progress}%` }}
                ></div>
              </div>
            </div>

            <p className="text-xs text-[#888] leading-relaxed font-sans mb-6">
              {getProgressPhrase()}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 font-mono">
              <div className="bg-[#111] p-2 text-[10px] border border-white/5">
                <span className="text-zinc-500 block uppercase text-[8px]">DISK FREEDOM</span>
                <span className="text-zinc-300">{metrics.diskFreeGb.toFixed(1)}GB FREE</span>
              </div>
              <div className="bg-[#111] p-2 text-[10px] border border-white/5">
                <span className="text-zinc-500 block uppercase text-[8px]">ACTIVE SPEED</span>
                <span className="text-zinc-300">{(config.throughputMbps).toFixed(0)} MS REFL</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-zinc-500">
            <span>READY_FOR_DEPLOYMENT</span>
            <span>v1.0.1_RE</span>
          </div>
        </div>

      </div>
    </div>
  );
}
