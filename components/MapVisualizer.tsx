import React from 'react';
import { Agent, AgentStatus } from '../types';

interface MapVisualizerProps {
  agents: Agent[];
}

// Room Definitions
const ROOMS = [
  { id: 'living', name: '客厅 (Living)', x: 20, y: 20, w: 200, h: 180, color: '#1e293b' },
  { id: 'kitchen', name: '厨房 (Kitchen)', x: 240, y: 20, w: 140, h: 120, color: '#1e293b' },
  { id: 'study', name: '书房 (Study)', x: 20, y: 220, w: 160, h: 140, color: '#1e293b' },
  { id: 'hall', name: '走廊 (Hall)', x: 200, y: 220, w: 180, h: 60, color: '#334155' },
];

const DOORS = [
  { x1: 220, y1: 80, x2: 240, y2: 80 }, // Living <-> Kitchen
  { x1: 100, y1: 200, x2: 100, y2: 220 }, // Living <-> Study
  { x1: 200, y1: 250, x2: 220, y2: 250 }, // Study <-> Hall
];

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ agents }) => {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-xl flex-1 relative overflow-hidden shadow-inner">
        
        {/* Map Header Overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
           <h3 className="text-slate-400 text-xs uppercase tracking-wider bg-slate-900/90 px-2 py-1 rounded backdrop-blur border border-slate-700">场景实时重构</h3>
        </div>

        {/* SVG Map Layer */}
        <svg viewBox="0 0 400 400" className="absolute top-0 left-0 w-full h-full opacity-80">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Rooms */}
          {ROOMS.map(room => (
            <g key={room.id}>
              <rect 
                x={room.x} y={room.y} width={room.w} height={room.h} 
                fill={room.color} stroke="#475569" strokeWidth="2" 
                rx="4"
              />
              <text 
                x={room.x + 10} y={room.y + 20} 
                className="text-[10px] fill-slate-500 font-mono font-bold"
              >
                {room.name}
              </text>
            </g>
          ))}

          {/* Doors */}
          {DOORS.map((door, i) => (
            <line 
              key={i} 
              x1={door.x1} y1={door.y1} x2={door.x2} y2={door.y2} 
              stroke="#fbbf24" strokeWidth="4" strokeDasharray="4 2"
            />
          ))}
        </svg>

        {/* HTML Avatar Layer for Animations */}
        <div className="absolute inset-0 w-full h-full">
            {agents.map(agent => {
                // Map local 400x400 coordinates to percentage
                const left = (agent.position.x / 400) * 100;
                const top = (agent.position.y / 400) * 100;

                return (
                    <div 
                        key={agent.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out flex flex-col items-center"
                        style={{ left: `${left}%`, top: `${top}%` }}
                    >
                        {/* Speech Bubble */}
                        {agent.status === AgentStatus.Talking && agent.lastDialogue && (
                            <div className="absolute bottom-full mb-2 bg-white text-slate-900 text-[10px] p-2 rounded-lg rounded-bl-none shadow-lg whitespace-nowrap z-20 animate-bounce max-w-[150px] truncate border-2 border-cyan-500">
                                {agent.lastDialogue}
                            </div>
                        )}

                        {/* Avatar */}
                        <div className={`relative w-10 h-10 rounded-full border-2 shadow-lg z-10 ${
                            agent.status === AgentStatus.Dead ? 'border-slate-500 grayscale opacity-80' : 
                            agent.status === AgentStatus.Talking ? 'border-green-400 ring-2 ring-green-400/30' : 
                            'border-cyan-400'
                        }`}>
                            <img src={agent.avatar} alt={agent.name} className="w-full h-full rounded-full object-cover" />
                            {/* Status Indicator */}
                            {agent.status === AgentStatus.Thinking && (
                                <div className="absolute -top-1 -right-1 text-lg">💭</div>
                            )}
                            {agent.status === AgentStatus.Panic && (
                                <div className="absolute -top-1 -right-1 text-lg">❗</div>
                            )}
                        </div>
                        
                        {/* Name Label */}
                        <span className="mt-1 text-[9px] bg-slate-900/80 px-1.5 py-0.5 rounded text-white font-bold backdrop-blur-sm whitespace-nowrap">
                            {agent.name}
                        </span>
                    </div>
                );
            })}
        </div>

      </div>
      
      {/* Mini Event Feed for Map Context */}
      <div className="mt-4 h-24 bg-slate-900 rounded-lg p-3 overflow-y-auto border border-slate-800">
         <div className="text-[10px] text-slate-500 uppercase mb-2 flex justify-between">
            <span>环境与空间事件</span>
            <span>LIVE</span>
         </div>
         <div className="text-xs text-slate-400 font-mono space-y-1">
            <p>> 厨房监测到高分贝争吵声。</p>
            <p>> 书房门禁系统已激活。</p>
         </div>
      </div>
    </div>
  );
};
