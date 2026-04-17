import React, { useState, useEffect } from "react";
import { Folder, FileText, Search, Code, Save, RefreshCw } from "lucide-react";

interface FSItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

export function WorkspaceView() {
  const [currentPath, setCurrentPath] = useState("");
  const [items, setItems] = useState<FSItem[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (pathStr: string) => {
    try {
      const res = await fetch(`/api/fs/list?path=${encodeURIComponent(pathStr)}`);
      const data = await res.json();
      setItems(data.sort((a: FSItem, b: FSItem) => {
        if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
        return a.isDirectory ? -1 : 1;
      }));
    } catch(e) {
      console.error(e);
    }
  };

  const openFile = async (filePath: string) => {
    try {
      const res = await fetch(`/api/fs/read?path=${encodeURIComponent(filePath)}`);
      if (!res.ok) throw new Error("Failed to read");
      const data = await res.json();
      setFileContent(data.content);
      setSelectedFilePath(filePath);
    } catch(e) {
      console.error(e);
      alert("Cannot open binary or inaccessible file.");
    }
  };

  const handleSave = async () => {
    if (!selectedFilePath) return;
    setIsSaving(true);
    try {
      await fetch('/api/fs/write', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ targetPath: selectedFilePath, content: fileContent })
      });
    } catch(e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full bg-panel border border-border-default rounded-xl overflow-hidden shadow-sm">
      {/* File Explorer Sidebar */}
      <div className="w-64 border-r border-border-default flex flex-col bg-bg-base/50">
        <div className="p-4 border-b border-border-default flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Folder className="w-4 h-4 text-accent" /> Workspace
          </h3>
          <button onClick={() => loadDirectory(currentPath)}><RefreshCw className="w-3.5 h-3.5 text-text-dim hover:text-white" /></button>
        </div>
        <div className="p-2 border-b border-border-default text-xs text-text-dim font-mono break-all flex items-center gap-1">
          <span className="text-accent cursor-pointer" onClick={() => setCurrentPath("")}>~</span>
          {currentPath && <span>/{currentPath}</span>}
          {currentPath !== "" && (
             <button className="ml-auto text-text-dim hover:text-white pb-1" onClick={() => {
                const parts = currentPath.split('/');
                parts.pop();
                setCurrentPath(parts.join('/'));
             }}>.. up</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {items.map(item => (
            <button 
              key={item.name}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm rounded hover:bg-white/5 transition-colors ${selectedFilePath === item.path ? 'bg-accent/10 text-accent' : 'text-text-main'}`}
              onClick={() => {
                if (item.isDirectory) setCurrentPath(item.path);
                else openFile(item.path);
              }}
            >
              {item.isDirectory ? <Folder className="w-4 h-4 text-blue-400 shrink-0" /> : <FileText className="w-4 h-4 text-text-dim shrink-0" />}
              <span className="truncate">{item.name}</span>
            </button>
          ))}
          {items.length === 0 && <div className="text-xs text-text-dim text-center py-4">Directory Empty</div>}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-panel">
        {selectedFilePath ? (
          <>
            <div className="h-12 border-b border-border-default px-4 flex items-center justify-between bg-bg-base/30">
               <div className="flex items-center gap-2 text-sm text-text-main font-mono">
                 <Code className="w-4 h-4 text-accent" /> {selectedFilePath.split('/').pop()}
               </div>
               <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-3 py-1.5 rounded text-xs font-semibold transition-colors"
               >
                 {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
               </button>
            </div>
            <textarea 
              value={fileContent || ""}
              onChange={(e) => setFileContent(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-transparent p-4 text-sm font-mono text-text-main outline-none resize-none"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-dim flex-col gap-3">
             <FileText className="w-12 h-12 opacity-20" />
             <p>Select a file from the workspace to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
