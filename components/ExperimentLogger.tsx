import React, { useState } from 'react';
import { LogEntry, EmergenceTag } from '../types';

interface ExperimentLoggerProps {
  logs: LogEntry[];
  onTagEmergence: (tag: Omit<EmergenceTag, 'id' | 'timestamp'>) => void;
  onExport: () => void;
}

export const ExperimentLogger: React.FC<ExperimentLoggerProps> = ({ logs, onTagEmergence, onExport }) => {
  const [tagMode, setTagMode] = useState(false);
  const [tagCategory, setTagCategory] = useState<EmergenceTag['category']>('Unexpected Coop');
  const [tagDesc, setTagDesc] = useState('');

  const handleTagSubmit = () => {
    if (!tagDesc) return;
    onTagEmergence({ category: tagCategory, description: tagDesc });
    setTagDesc('');
    setTagMode(false);
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Control Bar */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setTagMode(!tagMode)}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-900/20"
        >
          {tagMode ? '取消' : '⚡ 捕捉涌现行为'}
        </button>
        <button 
          onClick={onExport}
          className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg flex items-center justify-center"
          title="导出实验数据"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
      </div>

      {/* Tagging Form */}
      {tagMode && (
        <div className="mb-4 bg-slate-900 border border-amber-500/50 p-3 rounded-xl animate-fadeIn">
            <h4 className="text-amber-400 text-xs font-bold mb-2">记录 AI 涌现行为 (Emergence)</h4>
            <div className="space-y-2">
                <select 
                    value={tagCategory}
                    onChange={(e) => setTagCategory(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-200 text-xs p-2 rounded border border-slate-700"
                >
                    <option value="Unexpected Coop">意外合作 (Cooperation)</option>
                    <option value="Creative Lie">创造性谎言 (Lying)</option>
                    <option value="Irrational">非理性行为 (Irrational)</option>
                    <option value="Other">其他 (Other)</option>
                </select>
                <textarea 
                    value={tagDesc}
                    onChange={(e) => setTagDesc(e.target.value)}
                    placeholder="描述观察到的智能体涌现行为细节..."
                    className="w-full h-16 bg-slate-950 text-slate-200 text-xs p-2 rounded border border-slate-700 resize-none"
                />
                <button 
                    onClick={handleTagSubmit}
                    className="w-full bg-amber-700 text-white text-xs font-bold py-2 rounded"
                >
                    保存记录
                </button>
            </div>
        </div>
      )}

      {/* Log Feed */}
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
        <div className="p-2 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
           完整实验日志 (Session Logs)
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-xs">
            {logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                    <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                    <div className="flex-1">
                        <span className={`font-bold mr-2 uppercase ${
                            log.type === 'SYSTEM' ? 'text-slate-500' :
                            log.type === 'INTERVENTION' ? 'text-cyan-400' :
                            log.type === 'EMERGENCE' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                            {log.type}:
                        </span>
                        <span className="text-slate-300">{log.content}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
