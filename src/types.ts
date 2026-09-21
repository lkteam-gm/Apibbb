export type MonitorStatus = 'UP' | 'DOWN' | 'PENDING' | 'PAUSED';

export interface Heartbeat {
  id: string;
  timestamp: string;
  status: 'UP' | 'DOWN';
  latency: number;
  statusCode: number | null;
  message: string;
}

export interface Incident {
  id: string;
  monitorId: string;
  monitorName: string;
  startedAt: string;
  resolvedAt: string | null;
  durationSeconds: number | null;
  reason: string;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'HEAD';
  interval: number; // in seconds
  timeout: number;  // in seconds
  expectedStatus: number; // default 200
  keyword?: string;
  status: MonitorStatus;
  lastCheck?: string;
  lastResponseTime?: number;
  lastStatusCode?: number | null;
  lastMessage?: string;
  uptime24h: number; // percentage e.g. 99.8
  heartbeats: Heartbeat[]; // last 50-60 heartbeats for visual ticks
  activeIncident?: {
    startedAt: string;
    reason: string;
  } | null;
  tags?: string[];
  createdAt: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifyOnDown: boolean;
  notifyOnRecovery: boolean;
}

export interface SystemStats {
  upCount: number;
  downCount: number;
  pausedCount: number;
  totalCount: number;
  overallUptime: number;
  avgLatency: number;
  ramUsageMb: number;
  uptimeSeconds: number;
}
