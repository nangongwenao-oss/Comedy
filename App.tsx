import React, { useState, useEffect } from 'react';
import { ViewMode, Agent, PlotNode, LogEntry, AgentStatus, EmergenceTag } from './types';
import { Dashboard } from './components/Dashboard';
import { AgentMonitor } from './components/AgentMonitor';
import { MapVisualizer } from './components/MapVisualizer';
import { DirectorConsole } from './components/DirectorConsole';
import { ExperimentLogger } from './components/ExperimentLogger';

// --- Icons ---
const Icons = {
  Dashboard: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Agents: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Map: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.806-.982l-4.661-1.165M15 7l-6-3m6 3v9a1 1 0 01-1 1" /></svg>,
  Director: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
  Experiment: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
};

// --- Initial Data ---
const INITIAL_AGENTS: Agent[] = [
  {
    id: 'a1', name: 'Dr. Black', role: '死者 (Victim)', avatar: 'https://ui-avatars.com/api/?name=Dr+Black&background=333&color=fff',
    status: AgentStatus.Dead, position: { x: 50, y: 50, room: 'living' },
    emotions: { stress: 0, suspicion: 0, trust: 0 },
    currentThought: '...', shortTermMemories: []
  },
  {
    id: 'a2', name: 'Scarlett', role: '嫌疑人 (Wife)', avatar: 'https://ui-avatars.com/api/?name=Scarlett&background=d00&color=fff',
    status: AgentStatus.Talking, position: { x: 300, y: 60, room: 'kitchen' },
    emotions: { stress: 80, suspicion: 40, trust: 20 },
    currentThought: '他到底是不是发现那瓶毒药了？', 
    shortTermMemories: [],
    lastDialogue: '我真的什么都不知道！'
  },
  {
    id: 'a3', name: 'Mustard', role: '嫌疑人 (Partner)', avatar: 'https://ui-avatars.com/api/?name=Mustard&background=da0&color=fff',
    status: AgentStatus.Moving, position: { x: 80, y: 240, room: 'study' },
    emotions: { stress: 40, suspicion: 80, trust: 10 },
    currentThought: '保险柜密码...我必须想起来。',
    shortTermMemories: [],
    lastDialogue: '走开，别烦我。'
  },
  {
    id: 'a4', name: 'White', role: '女仆 (Witness)', avatar: 'https://ui-avatars.com/api/?name=Mrs+White&background=eee&color=333',
    status: AgentStatus.Idle, position: { x: 140, y: 90, room: 'living' },
    emotions: { stress: 90, suspicion: 10, trust: 50 },
    currentThought: '地毯上的血迹...太可怕了。',
    shortTermMemories: [],
    lastDialogue: '天哪...老爷他...'
  }
];

const INITIAL_NODES: PlotNode[] = [
  { id: 'n1', title: '尸体发现 (Discovery)', status: 'COMPLETED', description: 'Dr. Black 被发现死在客厅地毯上。', progress: 100 },
  { id: 'n2', title: '不在场证明 (Alibis)', status: 'ACTIVE', description: '玩家们开始互相质证案发时间的动向。', progress: 45 },
  { id: 'n3', title: '解开密室 (Locked Room)', status: 'LOCKED', description: '寻找书房密室的钥匙。', progress: 0 },
];

const DIALOGUES = [
    "这里太黑了，谁去开灯？",
    "我发誓我当时在厨房切水果！",
    "别装了，我们都知道你和Black博士的关系。",
    "那个花瓶...好像被人动过。",
    "有没有人看到我的项链？",
    "警察大概半小时后到。",
    "我觉得凶手就在我们中间。",
    "昨晚九点，我听到了争吵声。"
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.Dashboard);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [nodes, setNodes] = useState<PlotNode[]>(INITIAL_NODES);
  const [truthRevealed, setTruthRevealed] = useState(35);
  const [logs, setLogs] = useState<LogEntry[]>([
      { id: 'l1', type: 'SYSTEM', content: '剧本杀沙箱模拟已启动。', timestamp: new Date().toISOString() },
      { id: 'l2', type: 'AGENT', content: 'Scarlett: "我真的什么都不知道！"', timestamp: new Date().toISOString() }
  ]);
  const [summary, setSummary] = useState("游戏开始。Dr. Black 确认死亡，现场已被封锁。");

  // --- Game Loop: Simulation Engine ---
  useEffect(() => {
    const interval = setInterval(() => {
       // 1. Randomly pick an active agent
       const activeAgents = agents.filter(a => a.status !== AgentStatus.Dead);
       const targetAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
       const action = Math.random();

       // 2. Perform Action
       if (action < 0.3) {
           // Move
           const newX = Math.max(20, Math.min(380, targetAgent.position.x + (Math.random() * 60 - 30)));
           const newY = Math.max(20, Math.min(380, targetAgent.position.y + (Math.random() * 60 - 30)));
           updateAgent(targetAgent.id, { 
               status: AgentStatus.Moving, 
               position: { ...targetAgent.position, x: newX, y: newY }
            });
       } else if (action < 0.6) {
           // Talk
           const line = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
           updateAgent(targetAgent.id, { 
               status: AgentStatus.Talking, 
               lastDialogue: line 
            });
           addLog('AGENT', `${targetAgent.name}: "${line}"`);
       } else {
           // Think / Idle
           updateAgent(targetAgent.id, { status: AgentStatus.Thinking });
       }

       // 3. Slowly reveal truth based on interactions
       if (Math.random() < 0.1 && truthRevealed < 90) {
           setTruthRevealed(prev => prev + 1);
       }

    }, 2500); // Tick every 2.5s

    return () => clearInterval(interval);
  }, [agents, truthRevealed]);

  const updateAgent = (id: string, updates: Partial<Agent>) => {
      setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addLog = (type: LogEntry['type'], content: string) => {
      const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type,
          content
      };
      setLogs(prev => [newLog, ...prev]);
  };

  const handleIntervention = (type: string, details: any) => {
    addLog('INTERVENTION', `导播执行 [${type}]: ${details.content} -> ${details.target}`);
    
    // Immediate visual feedback on agent
    if (details.target !== 'Global') {
        setAgents(prev => prev.map(a => {
            if (a.id === details.target) {
                return {
                    ...a,
                    status: AgentStatus.Panic,
                    currentThought: `!!! 突然觉得: ${details.content}`,
                    emotions: { ...a.emotions, stress: 100 }
                };
            }
            return a;
        }));
        setTimeout(() => {
             // Reset status after a bit
             setAgents(prev => prev.map(a => a.id === details.target ? { ...a, status: AgentStatus.Thinking } : a));
        }, 5000);
    }
  };

  const handleTagEmergence = (tag: Omit<EmergenceTag, 'id' | 'timestamp'>) => {
      addLog('EMERGENCE', `[${tag.category}] ${tag.description}`);
  };

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ agents, nodes, logs }, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "experiment_data.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans">
      
      {/* Top Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                A.E.C. 剧本杀控制台
            </h1>
            <span className="text-[10px] text-slate-500 border border-slate-800 px-1 rounded">V1.0</span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
           SESSION: #8492-CN
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {view === ViewMode.Dashboard && (
            <Dashboard 
                nodes={nodes} 
                truthRevealed={truthRevealed} 
                anomalies={['Scarlett 行为逻辑与人设偏差 15%']}
                recentSummary={summary}
                logs={logs}
            />
        )}
        {view === ViewMode.Agents && <AgentMonitor agents={agents} />}
        {view === ViewMode.Map && <MapVisualizer agents={agents} />}
        {view === ViewMode.Director && <DirectorConsole agents={agents} onIntervention={handleIntervention} />}
        {view === ViewMode.Experiment && (
            <ExperimentLogger 
                logs={logs} 
                onTagEmergence={handleTagEmergence} 
                onExport={handleExport}
            />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="h-16 bg-slate-900 border-t border-slate-800 flex justify-around items-center shrink-0 z-30 pb-safe">
        <NavButton 
            active={view === ViewMode.Dashboard} 
            icon={Icons.Dashboard} 
            label="仪表盘" 
            onClick={() => setView(ViewMode.Dashboard)} 
        />
        <NavButton 
            active={view === ViewMode.Agents} 
            icon={Icons.Agents} 
            label="心智" 
            onClick={() => setView(ViewMode.Agents)} 
        />
        <NavButton 
            active={view === ViewMode.Map} 
            icon={Icons.Map} 
            label="地图" 
            onClick={() => setView(ViewMode.Map)} 
        />
        <div className="relative -top-5">
             <button 
                onClick={() => setView(ViewMode.Director)}
                className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg shadow-cyan-500/30 transition-transform active:scale-95 ${view === ViewMode.Director ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'}`}
             >
                {Icons.Director}
             </button>
        </div>
        <NavButton 
            active={view === ViewMode.Experiment} 
            icon={Icons.Experiment} 
            label="实验" 
            onClick={() => setView(ViewMode.Experiment)} 
        />
      </div>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${active ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className="mb-1">{icon}</div>
    <span className="text-[10px] font-bold tracking-wide">{label}</span>
  </button>
);

export default App;
