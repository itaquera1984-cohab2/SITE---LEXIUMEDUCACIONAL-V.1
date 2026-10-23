import { WorkspaceFile, CompilerLog } from './types';

export const INITIAL_FILES: WorkspaceFile[] = [
  {
    name: 'src/App.tsx',
    path: '/src/App.tsx',
    content: `import React, { useState } from 'react';
import { Sparkles, Terminal, Activity } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'console'>('visualizer');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-8">
      <header className="border-b border-white/10 pb-4 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight text-blue-500">
          Neural Interface
        </h1>
        <p className="text-xs text-zinc-500 font-mono">STATUS: SYNC_RESOLVED</p>
      </header>

      <main className="grid grid-cols-12 gap-8">
        <div className="col-span-8 bg-[#111] p-6 border border-white/5 rounded-none">
          <h2 className="text-xl font-bold mb-4">Workspace Board</h2>
          <div className="p-4 bg-zinc-900 border border-zinc-800 font-mono text-xs">
            Listening for state triggers...
          </div>
        </div>
      </main>
    </div>
  );
}`,
    language: 'typescript',
    sizeBytes: 814,
    linesOfCode: 24,
  },
  {
    name: 'server.ts',
    path: '/server.ts',
    content: `import express from 'express';
import path from 'path';
import { createServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // AI Inference Proxy
  app.post('/api/inference', express.json(), (req, res) => {
    const { payload } = req.body;
    res.json({
      status: 'success',
      vectorId: Math.random().toString(16).substring(2),
      timestamp: Date.now()
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server active on port \${PORT}\`);
  });
}

startServer();`,
    language: 'typescript',
    sizeBytes: 864,
    linesOfCode: 42,
  },
  {
    name: 'package.json',
    path: '/package.json',
    content: `{
  "name": "neural-compiled-applet",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle",
    "start": "node dist/server.cjs"
  },
  "dependencies": {
    "express": "^4.21.2",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1"
  }
}`,
    language: 'json',
    sizeBytes: 342,
    linesOfCode: 16,
  },
  {
    name: 'index.html',
    path: '/index.html',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Neural Web Bridge</title>
  </head>
  <body class="bg-[#050505] text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    language: 'html',
    sizeBytes: 312,
    linesOfCode: 12,
  }
];

export const COMPILATION_STEPS = [
  { id: 'connect', label: 'BRIDGE CONNECTION', ratio: 0.1, msg: 'Initializing secure tunnel to Origin AI Studio...' },
  { id: 'fetch', label: 'FETCHING MANIFESTS', ratio: 0.25, msg: 'Synchronizing project files & module registry...' },
  { id: 'validate', label: 'PARSING VECTORS', ratio: 0.45, msg: 'Verifying dependencies and executing Type Analyzer...' },
  { id: 'compile', label: 'TRANSPILING SYSTEM', ratio: 0.75, msg: 'Compiling ESM source codes and bundling assets...' },
  { id: 'optimize', label: 'BUNDLE OPTIMIZER', ratio: 0.9, msg: 'Executing minification, tree-shaking and vector scaling...' },
  { id: 'deploy', label: 'DEPLOYING WORKSPACE', ratio: 1.0, msg: 'Allocating target heap sectors & booting local server...' }
];

export function getTimestamp(): string {
  const d = new Date();
  return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

export const GENERATE_INITIAL_LOGS = (): CompilerLog[] => [
  {
    id: 'l1',
    time: getTimestamp(),
    message: 'SYSTEM BRIDGE CORE ONLINE. Port router allocated (Tunnel SSL: active).',
    type: 'info'
  },
  {
    id: 'l2',
    time: getTimestamp(),
    message: 'Ready to bridge workspace environment vectors from remote AI Studio source.',
    type: 'info'
  },
];
