import React, { useState } from 'react';
import { FileCode, Plus, Trash2, Edit3, Eye, FileJson, Check, PlusCircle } from 'lucide-react';
import { WorkspaceFile } from '../types';

interface FileEditorProps {
  files: WorkspaceFile[];
  onUpdateFile: (path: string, newContent: string) => void;
  onAddFile: (name: string, content: string, language: WorkspaceFile['language']) => void;
  onDeleteFile: (path: string) => void;
}

export default function FileEditor({ files, onUpdateFile, onAddFile, onDeleteFile }: FileEditorProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('/src/App.tsx');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [newLanguage, setNewLanguage] = useState<WorkspaceFile['language']>('typescript');
  const [addError, setAddError] = useState('');

  const activeFile = files.find(f => f.path === selectedFilePath) || files[0];

  const handleContentChange = (val: string) => {
    onUpdateFile(activeFile.path, val);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!newFileName.trim()) {
      setAddError('Filename cannot be empty.');
      return;
    }

    const sanitizedName = newFileName.trim();
    // Validate path formatting slightly
    const path = sanitizedName.startsWith('/') ? sanitizedName : `/${sanitizedName}`;

    // Avoid duplicated path
    if (files.some(f => f.path === path)) {
      setAddError('A file is already mapped to this workspace path.');
      return;
    }

    // Determine language by extension
    let lang: WorkspaceFile['language'] = 'typescript';
    if (sanitizedName.endsWith('.css')) lang = 'css';
    else if (sanitizedName.endsWith('.html')) lang = 'html';
    else if (sanitizedName.endsWith('.json')) lang = 'json';

    onAddFile(sanitizedName, newFileContent || `// ${sanitizedName} initialized`, lang);
    setSelectedFilePath(path);
    setShowAddForm(false);
    setNewFileName('');
    setNewFileContent('');
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.json')) return <span className="text-amber-500 font-bold font-mono text-[10px] bg-amber-500/10 px-1 border border-amber-500/20">JSON</span>;
    if (fileName.endsWith('.html')) return <span className="text-red-400 font-bold font-mono text-[10px] bg-red-400/10 px-1 border border-red-400/20">HTML</span>;
    if (fileName.endsWith('.css')) return <span className="text-blue-400 font-bold font-mono text-[10px] bg-blue-400/10 px-1 border border-blue-400/20">CSS</span>;
    return <span className="text-teal-400 font-bold font-mono text-[10px] bg-teal-400/10 px-1 border border-teal-400/20">TSX</span>;
  };

  // Generate fake lines for editor
  const codeLines = activeFile ? activeFile.content.split('\n') : [];

  return (
    <div className="grid grid-cols-12 gap-6 border border-white/10 bg-[#080808]" id="file-editor-widget">
      {/* Sidebar - Files lists */}
      <div className="col-span-12 md:col-span-4 border-r border-white/10 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">SRC_INTEGRATED_REPOS</span>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-zinc-500 hover:text-white transition-all p-1"
              title="Add a new custom file payload"
              id="show-add-file-form-btn"
            >
              <PlusCircle size={14} className="text-zinc-400" />
            </button>
          </div>

          {/* Files container */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {files.map((file) => {
              const isSelected = file.path === selectedFilePath;
              return (
                <div
                  key={file.path}
                  onClick={() => {
                    setSelectedFilePath(file.path);
                    setShowAddForm(false);
                  }}
                  className={`flex items-center justify-between p-2.5 cursor-pointer font-mono text-xs transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-l-2 border-blue-500 text-white'
                      : 'hover:bg-zinc-950 text-zinc-400 border-l-2 border-transparent'
                  }`}
                  id={`file-tab-${file.name.replace(/\./g, '-')}`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {getFileIcon(file.name)}
                    <span className="truncate" title={file.path}>{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#444] font-mono shrink-0">{(file.sizeBytes / 1024).toFixed(1)}k</span>
                    {files.length > 2 && file.path !== '/src/App.tsx' && file.path !== '/server.ts' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFile(file.path);
                          if (selectedFilePath === file.path) {
                            setSelectedFilePath('/src/App.tsx');
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-0.5"
                        title="Delete payload file"
                        id={`delete-file-btn-${file.name.replace(/\./g, '-')}`}
                      >
                        <Trash2 size={11} className="text-zinc-600 hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Specs panel */}
        <div className="mt-8 border-t border-white/5 pt-4">
          <div className="bg-[#111] p-3 text-[11px] font-mono space-y-1.5 text-zinc-500">
            <div className="text-white font-bold mb-1 uppercase text-xs">SOURCE METADATA</div>
            <div className="flex justify-between">
              <span>Total payload files:</span>
              <span className="text-zinc-300">{files.length} ITEMS</span>
            </div>
            <div className="flex justify-between">
              <span>Overall Repository:</span>
              <span className="text-zinc-300">
                {(files.reduce((acc, f) => acc + f.sizeBytes, 0) / 1024).toFixed(2)} KB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Code complexity index:</span>
              <span className="text-green-400">STABLE MATCH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel: Editor or Add File Form */}
      <div className="col-span-12 md:col-span-8 p-5 flex flex-col h-110">
        {showAddForm ? (
          <form onSubmit={handleCreateFile} className="flex-1 flex flex-col justify-between" id="add-file-form">
            <div className="space-y-4">
              <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-zinc-300">MAP_NEW_WORKSPACE_PAYLOAD</h3>

              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Target Filename / Path with suffix (e.g. src/utils.ts, styles.css)</label>
                <input
                  type="text"
                  placeholder="e.g. src/helper.ts"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full bg-[#111] border border-zinc-800 text-xs font-mono text-zinc-300 p-3 rounded-none outline-none focus:border-white/20"
                  id="new-file-name-input"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Payload Starter Template Code</label>
                <textarea
                  rows={8}
                  placeholder={`export function compileAction() {\n  return "VECT_SYNC_TRUE";\n}`}
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  className="w-full bg-[#111] border border-zinc-800 text-xs font-mono text-zinc-300 p-3 rounded-none outline-none focus:border-white/20 h-44"
                  id="new-file-content-input"
                />
              </div>

              {addError && <p className="text-xs text-red-400 font-mono italic">❌ {addError}</p>}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-white/15 text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white"
                id="cancel-add-file-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-black uppercase tracking-widest transition-colors"
                id="submit-add-file-btn"
              >
                Register File
              </button>
            </div>
          </form>
        ) : (
          /* Real code text area with simulated line numbers left side */
          activeFile && (
            <div className="flex-1 flex flex-col h-full" id="active-editor-view">
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">ACTIVE FILE BUFFERED</span>
                  <span className="text-sm font-mono font-bold text-white text-blue-400">{activeFile.path}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                  <span>Lines: {codeLines.length}</span>
                  <span>Size: {activeFile.sizeBytes} Bytes</span>
                </div>
              </div>

              {/* Code visual display text-area */}
              <div className="flex-1 flex bg-[#0d0d0d] border border-white/5 overflow-hidden relative">
                {/* Simulated vertical layout gutter with line count */}
                <div className="bg-[#0b0b0b] px-3.5 py-3 text-right text-zinc-600 font-mono text-xs select-none border-r border-white/5 leading-relaxed overflow-hidden">
                  {codeLines.map((_, index) => (
                    <div key={index} className="h-6 leading-6 text-[#444] text-[10px]">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  ))}
                </div>

                <textarea
                  value={activeFile.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="flex-1 bg-transparent text-zinc-300 font-mono text-xs p-3 leading-6 outline-none resize-none focus:ring-0 overflow-y-auto h-full scrollbar-none"
                  spellCheck={false}
                  placeholder={`// Insert source code structure here`}
                  id="source-code-textarea"
                />
              </div>

              <div className="pt-2 text-[10px] font-mono text-zinc-500 flex justify-between items-center bg-transparent mt-1">
                <span>PRESS CORDS AND SYSTEM SYNC IN REAL-TIME</span>
                <span className="text-emerald-500 select-none">✔ PAYLOAD COMMITTED TO COMPILATION PIPELINE</span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
