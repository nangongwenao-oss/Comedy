export enum AgentStatus {
  Idle = '空闲',
  Talking = '对话中',
  Moving = '移动中',
  Thinking = '思考中',
  Panic = '恐慌',
  Dead = '已死亡'
}

export interface Memory {
  id: string;
  content: string;
  type: 'FACT' | 'OPINION' | 'FALSEHOOD';
  strength: number; // 0-100
  timestamp: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string; // URL
  status: AgentStatus;
  position: { x: number; y: number; room: string };
  emotions: {
    stress: number;
    suspicion: number;
    trust: number;
  };
  currentThought: string;
  shortTermMemories: Memory[];
  lastDialogue?: string; // For speech bubbles
}

export interface PlotNode {
  id: string;
  title: string;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
  description: string;
  progress: number; // 0-100
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'SYSTEM' | 'AGENT' | 'INTERVENTION' | 'EMERGENCE';
  content: string;
  tags?: string[];
}

export interface EmergenceTag {
  id: string;
  timestamp: string;
  category: 'Unexpected Coop' | 'Creative Lie' | 'Irrational' | 'Other';
  description: string;
  agentId?: string;
}

export enum ViewMode {
  Dashboard = 'DASHBOARD',
  Agents = 'AGENTS',
  Map = 'MAP',
  Director = 'DIRECTOR',
  Experiment = 'EXPERIMENT'
}
