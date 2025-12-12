import React, { useRef, useEffect } from 'react';
import { PlotNode, LogEntry } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  nodes: PlotNode[];
  truthRevealed: number; // 0-100
  anomalies: string[];
  recentSummary: string;
  logs: LogEntry[];
}

const COLORS = ['#10b981', '#334155']; 

export const Dashboard: React.FC<DashboardProps> = ({ nodes, truthRevealed, anomalies, recentSummary, logs }) => {
  const activeNode = nodes.find(n => n.status === 'ACTIVE');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const gaugeData = [
    { name: '已揭示', value: truthRevealed },
    { name: '未揭示', value: 100 - truthRevealed },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 space-y-4">
      {/* Top Section: Charts & Phase */}
      <div className="grid grid-cols-2 gap-4 shrink-0">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
          <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-2">真相揭示度</h3>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={35}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-3 text-xl font-bold text-emerald-400">
            {truthRevealed}%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-center">
          <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-2">当前剧情节点</h3>
          {activeNode ? (
            <div>
              <div className="text-cyan-400 font-bold truncate text-sm">{activeNode.title}</div>
              <div className="text-xs text-slate-500 mt-1 line-clamp-2">{activeNode.description}</div>
              <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full transition-all duration-500" 
                  style={{ width: `${activeNode.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm">所有节点已完成</div>
          )}
        </div>
      </div>

      {/* Anomalies Alert */}
      {anomalies.length > 0 && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 animate-pulse shrink-0">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            剧情异常预警
          </div>
          <ul className="mt-1 space-y-1">
            {anomalies.map((a, i) => (
              <li key={i} className="text-xs text-red-300 ml-6 list-disc">{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Real-time Feed (The "Action" Part) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider">实时剧情日志</h3>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                LIVE
            </span>
        </div>
        <div className="p-3 border-b border-slate-800 bg-indigo-950/20">
             <p className="text-slate-300 text-xs italic leading-relaxed">
                "{recentSummary}"
            </p>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
            {logs.slice().reverse().map((log) => (
                <div key={log.id} className="text-xs font-mono animate-fadeIn">
                    <span className="text-slate-600 mr-2">
                        {new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </span>
                    <span className={`font-bold mr-2 uppercase ${
                        log.type === 'SYSTEM' ? 'text-slate-500' :
                        log.type === 'AGENT' ? 'text-cyan-400' :
                        log.type === 'INTERVENTION' ? 'text-purple-400' : 'text-amber-400'
                    }`}>
                        {log.type === 'AGENT' ? '角色' : 
                         log.type === 'INTERVENTION' ? '干预' : 
                         log.type === 'EMERGENCE' ? '涌现' : '系统'}
                    </span>
                    <span className="text-slate-300">{log.content}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
