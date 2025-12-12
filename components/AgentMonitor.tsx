import React, { useState } from 'react';
import { Agent, AgentStatus } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface AgentMonitorProps {
  agents: Agent[];
}

const EmotionChart: React.FC<{ emotions: Agent['emotions'] }> = ({ emotions }) => {
  const data = [
    { subject: '压力', A: emotions.stress, fullMark: 100 },
    { subject: '怀疑', A: emotions.suspicion, fullMark: 100 },
    { subject: '信任', A: emotions.trust, fullMark: 100 },
  ];

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Radar name="Emotions" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AgentMonitor: React.FC<AgentMonitorProps> = ({ agents }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {agents.map(agent => {
        const isExpanded = expandedId === agent.id;
        
        return (
          <div 
            key={agent.id} 
            className={`border rounded-xl transition-all duration-300 overflow-hidden ${
              isExpanded ? 'bg-slate-900 border-cyan-800 shadow-lg shadow-cyan-900/10' : 'bg-slate-900/50 border-slate-800'
            }`}
          >
            {/* Header */}
            <div 
              className="p-3 flex items-center gap-3 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : agent.id)}
            >
              <div className="relative">
                <img src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800 object-cover" />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    agent.status === AgentStatus.Panic ? 'bg-red-500 animate-ping' :
                    agent.status === AgentStatus.Talking ? 'bg-green-500' :
                    agent.status === AgentStatus.Dead ? 'bg-slate-600' : 'bg-cyan-500'
                }`}></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-200 text-sm">{agent.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${
                    agent.status === AgentStatus.Panic ? 'border-red-500 text-red-400 bg-red-950' : 
                    agent.status === AgentStatus.Dead ? 'border-slate-600 text-slate-500 bg-slate-900' :
                    'border-slate-700 text-slate-400 bg-slate-800'
                  }`}>
                    {agent.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{agent.role}</div>
              </div>
              <svg 
                className={`w-5 h-5 text-slate-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="p-4 pt-0 border-t border-slate-800 mt-2 space-y-4 animate-fadeIn">
                
                {/* Internal Monologue */}
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 relative">
                   <div className="text-[10px] uppercase text-cyan-600 font-bold mb-1">当前心流 (Internal Monologue)</div>
                   <p className="text-sm text-cyan-100/90 italic">"{agent.currentThought}"</p>
                </div>

                {/* Emotions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 rounded-lg p-2">
                     <div className="text-[10px] uppercase text-slate-500 text-center mb-1">情绪维度</div>
                     <EmotionChart emotions={agent.emotions} />
                  </div>
                  <div className="space-y-2">
                     <div className="text-[10px] uppercase text-slate-500 mb-1">短期记忆</div>
                     <ul className="space-y-2 h-32 overflow-y-auto pr-1">
                       {agent.shortTermMemories.map(mem => (
                         <li key={mem.id} className="text-xs p-2 rounded bg-slate-800 border-l-2 border-indigo-500 text-slate-300">
                           {mem.content}
                         </li>
                       ))}
                       {agent.shortTermMemories.length === 0 && <li className="text-xs text-slate-600 italic">暂无关键记忆</li>}
                     </ul>
                  </div>
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
