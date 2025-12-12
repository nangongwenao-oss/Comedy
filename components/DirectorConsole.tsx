import React, { useState } from 'react';
import { Agent } from '../types';
import { getDirectorSuggestions } from '../services/geminiService';

interface DirectorConsoleProps {
  agents: Agent[];
  onIntervention: (type: string, details: any) => void;
}

export const DirectorConsole: React.FC<DirectorConsoleProps> = ({ agents, onIntervention }) => {
  const [mode, setMode] = useState<'MANUAL' | 'AI'>('AI');
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);

  // Manual Form States
  const [targetAgent, setTargetAgent] = useState(agents[0]?.id);
  const [interventionType, setInterventionType] = useState('MEMORY');
  const [content, setContent] = useState('');

  const handleAiAssist = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    setSuggestion(null);
    
    // Call Gemini
    const result = await getDirectorSuggestions(intent, "当前阶段: 客厅内众人正在互相推诿责任。");
    setSuggestion(result);
    setLoading(false);
  };

  const executeIntervention = (isAi: boolean) => {
    if (isAi && suggestion) {
        onIntervention(suggestion.actionType, { target: suggestion.target, content: suggestion.details });
        setSuggestion(null);
        setIntent('');
    } else {
        onIntervention(interventionType, { target: targetAgent, content });
        setContent('');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      
      {/* Toggle Mode */}
      <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 shrink-0">
        <button 
            onClick={() => setMode('AI')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'AI' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
            ✨ AI 智能副驾
        </button>
        <button 
            onClick={() => setMode('MANUAL')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'MANUAL' ? 'bg-cyan-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
            🛠 手动控制台
        </button>
      </div>

      {mode === 'AI' ? (
        <div className="flex-1 flex flex-col gap-4">
            <div className="bg-slate-900 border border-indigo-900/50 rounded-xl p-4 flex-1 flex flex-col">
                <label className="block text-indigo-300 text-sm font-bold mb-2">
                    输入模糊意图 (Fuzzy Intent)
                </label>
                <textarea
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    placeholder="例如：'让管家开始怀疑女主人' 或 '增加现在的紧张氛围'"
                    className="w-full flex-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
                
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleAiAssist}
                        disabled={loading || !intent}
                        className={`px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-2 ${loading ? 'bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-500'} text-white transition-colors w-full justify-center`}
                    >
                        {loading ? (
                             <>
                             <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             <span>AI 分析推理中...</span>
                             </>
                        ) : '生成干预策略'}
                    </button>
                </div>
            </div>

            {/* AI Suggestion Card */}
            {suggestion && (
                <div className="bg-slate-800 border-l-4 border-indigo-500 rounded-r-xl p-4 animate-slideIn shadow-lg">
                    <h4 className="text-white font-bold text-sm flex justify-between items-center mb-2">
                        <span>策略建议</span>
                        <span className="bg-indigo-900 text-indigo-300 text-[10px] px-2 py-1 rounded border border-indigo-700">{suggestion.actionType}</span>
                    </h4>
                    <p className="text-slate-400 text-xs mb-3 italic">" {suggestion.reasoning} "</p>
                    <div className="bg-slate-950 p-3 rounded text-sm font-mono text-cyan-300 border border-slate-700">
                        {'>'} {suggestion.details}
                    </div>
                    <button 
                        onClick={() => executeIntervention(true)}
                        className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-indigo-900/50"
                    >
                        确认执行并注入
                    </button>
                </div>
            )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                <div className="mb-4">
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">目标对象</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {agents.map(a => (
                            <button
                                key={a.id}
                                onClick={() => setTargetAgent(a.id)}
                                className={`flex-shrink-0 px-3 py-2 rounded border text-xs font-bold ${targetAgent === a.id ? 'bg-cyan-900 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                            >
                                {a.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">干预类型</label>
                    <select 
                        value={interventionType} 
                        onChange={(e) => setInterventionType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded p-2 outline-none focus:border-cyan-500"
                    >
                        <option value="MEMORY">记忆植入 (Memory Injection)</option>
                        <option value="EMOTION">情绪偏置 (Emotional Shift)</option>
                        <option value="EVENT">环境事件 (Trigger Event)</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">指令内容 / Payload</label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded p-2 h-32 outline-none focus:border-cyan-500"
                        placeholder="输入具体的记忆内容或事件参数..."
                    />
                </div>

                <button 
                    onClick={() => executeIntervention(false)}
                    disabled={!content}
                    className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white py-3 rounded-lg font-bold shadow-lg shadow-cyan-900/50"
                >
                    发送干预指令
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
