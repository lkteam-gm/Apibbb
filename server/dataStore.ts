import fs from 'fs';
import path from 'path';
import type { Monitor, Heartbeat, Incident, TelegramConfig, SystemStats } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const MONITORS_FILE = path.join(DATA_DIR, 'monitors.json');
const INCIDENTS_FILE = path.join(DATA_DIR, 'incidents.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_MONITORS: Monitor[] = [
  {
    id: 'mon-1',
    name: 'Google Cloud Gateway',
    url: 'https://www.google.com',
    method: 'GET',
    interval: 30,
    timeout: 5,
    expectedStatus: 200,
    status: 'UP',
    lastCheck: new Date().toISOString(),
    lastResponseTime: 42,
    lastStatusCode: 200,
    lastMessage: '200 OK',
    uptime24h: 99.98,
    heartbeats: Array.from({ length: 45 }).map((_, i) => ({
      id: `hb-1-${i}`,
      timestamp: new Date(Date.now() - (45 - i) * 60000).toISOString(),
      status: 'UP',
      latency: Math.floor(35 + Math.random() * 20),
      statusCode: 200,
      message: 'OK'
    })),
    tags: ['CDN', 'Core'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'mon-2',
    name: 'Cloudflare 1.1.1.1',
    url: 'https://1.1.1.1',
    method: 'GET',
    interval: 30,
    timeout: 5,
    expectedStatus: 200,
    status: 'UP',
    lastCheck: new Date().toISOString(),
    lastResponseTime: 28,
    lastStatusCode: 200,
    lastMessage: '200 OK',
    uptime24h: 100,
    heartbeats: Array.from({ length: 45 }).map((_, i) => ({
      id: `hb-2-${i}`,
      timestamp: new Date(Date.now() - (45 - i) * 60000).toISOString(),
      status: 'UP',
      latency: Math.floor(20 + Math.random() * 15),
      statusCode: 200,
      message: 'OK'
    })),
    tags: ['DNS', 'Edge'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'mon-3',
    name: 'GitHub Status API',
    url: 'https://www.githubstatus.com',
    method: 'GET',
    interval: 60,
    timeout: 10,
    expectedStatus: 200,
    status: 'UP',
    lastCheck: new Date().toISOString(),
    lastResponseTime: 85,
    lastStatusCode: 200,
    lastMessage: '200 OK',
    uptime24h: 99.85,
    heartbeats: Array.from({ length: 45 }).map((_, i) => ({
      id: `hb-3-${i}`,
      timestamp: new Date(Date.now() - (45 - i) * 60000).toISOString(),
      status: (i === 12 || i === 13) ? 'DOWN' : 'UP',
      latency: (i === 12 || i === 13) ? 0 : Math.floor(70 + Math.random() * 30),
      statusCode: (i === 12 || i === 13) ? 503 : 200,
      message: (i === 12 || i === 13) ? 'Service Unavailable' : 'OK'
    })),
    tags: ['API', 'Status'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'mon-4',
    name: 'Mi Servidor Personal (Demo)',
    url: 'https://httpstat.us/200',
    method: 'GET',
    interval: 30,
    timeout: 5,
    expectedStatus: 200,
    status: 'UP',
    lastCheck: new Date().toISOString(),
    lastResponseTime: 120,
    lastStatusCode: 200,
    lastMessage: '200 OK',
    uptime24h: 99.2,
    heartbeats: Array.from({ length: 45 }).map((_, i) => ({
      id: `hb-4-${i}`,
      timestamp: new Date(Date.now() - (45 - i) * 60000).toISOString(),
      status: 'UP',
      latency: Math.floor(100 + Math.random() * 40),
      statusCode: 200,
      message: 'OK'
    })),
    tags: ['VPS 512MB', 'Personal'],
    createdAt: new Date().toISOString()
  }
];

class DataStore {
  private monitors: Monitor[] = [];
  private incidents: Incident[] = [];
  private telegramConfig: TelegramConfig = {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    notifyOnDown: true,
    notifyOnRecovery: true
  };
  private startTime = Date.now();

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(MONITORS_FILE)) {
        const raw = fs.readFileSync(MONITORS_FILE, 'utf-8');
        this.monitors = JSON.parse(raw);
      } else {
        this.monitors = DEFAULT_MONITORS;
        this.saveMonitors();
      }

      if (fs.existsSync(INCIDENTS_FILE)) {
        const raw = fs.readFileSync(INCIDENTS_FILE, 'utf-8');
        this.incidents = JSON.parse(raw);
      } else {
        this.incidents = [
          {
            id: 'inc-1',
            monitorId: 'mon-3',
            monitorName: 'GitHub Status API',
            startedAt: new Date(Date.now() - 42 * 60000).toISOString(),
            resolvedAt: new Date(Date.now() - 40 * 60000).toISOString(),
            durationSeconds: 120,
            reason: 'HTTP 503 - Service Unavailable'
          }
        ];
        this.saveIncidents();
      }

      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.telegramConfig = { ...this.telegramConfig, ...parsed.telegram };
      }
    } catch (e) {
      console.error('Error loading data:', e);
      this.monitors = DEFAULT_MONITORS;
    }
  }

  private saveMonitors() {
    try {
      fs.writeFileSync(MONITORS_FILE, JSON.stringify(this.monitors, null, 2));
    } catch (e) {
      console.error('Error saving monitors:', e);
    }
  }

  private saveIncidents() {
    try {
      fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(this.incidents, null, 2));
    } catch (e) {
      console.error('Error saving incidents:', e);
    }
  }

  private saveSettings() {
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ telegram: this.telegramConfig }, null, 2));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }

  public getMonitors(): Monitor[] {
    return this.monitors;
  }

  public getMonitor(id: string): Monitor | undefined {
    return this.monitors.find(m => m.id === id);
  }

  public addMonitor(data: Partial<Monitor>): Monitor {
    const newMonitor: Monitor = {
      id: `mon-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name || 'Nuevo Monitor',
      url: data.url || 'https://',
      method: data.method || 'GET',
      interval: data.interval && data.interval >= 10 ? Number(data.interval) : 30,
      timeout: data.timeout && data.timeout >= 1 ? Number(data.timeout) : 5,
      expectedStatus: data.expectedStatus ? Number(data.expectedStatus) : 200,
      keyword: data.keyword?.trim() || undefined,
      status: 'PENDING',
      uptime24h: 100,
      heartbeats: [],
      tags: data.tags || [],
      createdAt: new Date().toISOString()
    };
    this.monitors.unshift(newMonitor);
    this.saveMonitors();
    return newMonitor;
  }

  public updateMonitor(id: string, data: Partial<Monitor>): Monitor | null {
    const idx = this.monitors.findIndex(m => m.id === id);
    if (idx === -1) return null;

    this.monitors[idx] = {
      ...this.monitors[idx],
      name: data.name ?? this.monitors[idx].name,
      url: data.url ?? this.monitors[idx].url,
      method: data.method ?? this.monitors[idx].method,
      interval: data.interval ? Number(data.interval) : this.monitors[idx].interval,
      timeout: data.timeout ? Number(data.timeout) : this.monitors[idx].timeout,
      expectedStatus: data.expectedStatus ? Number(data.expectedStatus) : this.monitors[idx].expectedStatus,
      keyword: data.keyword !== undefined ? data.keyword.trim() : this.monitors[idx].keyword,
      tags: data.tags ?? this.monitors[idx].tags,
    };
    this.saveMonitors();
    return this.monitors[idx];
  }

  public togglePause(id: string): Monitor | null {
    const monitor = this.getMonitor(id);
    if (!monitor) return null;
    monitor.status = monitor.status === 'PAUSED' ? 'PENDING' : 'PAUSED';
    this.saveMonitors();
    return monitor;
  }

  public deleteMonitor(id: string): boolean {
    const initialLen = this.monitors.length;
    this.monitors = this.monitors.filter(m => m.id !== id);
    if (this.monitors.length !== initialLen) {
      this.saveMonitors();
      return true;
    }
    return false;
  }

  public getIncidents(): Incident[] {
    return this.incidents.slice(0, 30);
  }

  public getTelegramConfig(): TelegramConfig {
    return this.telegramConfig;
  }

  public updateTelegramConfig(config: Partial<TelegramConfig>): TelegramConfig {
    this.telegramConfig = {
      ...this.telegramConfig,
      ...config,
    };
    this.saveSettings();
    return this.telegramConfig;
  }

  public async sendTelegramAlert(text: string): Promise<{ success: boolean; message: string }> {
    const { botToken, chatId } = this.telegramConfig;
    if (!botToken || !chatId) {
      return { success: false, message: 'Falta Bot Token o Chat ID de Telegram' };
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });
      const data = await res.json();
      if (data.ok) {
        return { success: true, message: 'Alerta enviada a Telegram con éxito' };
      } else {
        return { success: false, message: data.description || 'Error de API de Telegram' };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Error de conexión con Telegram' };
    }
  }

  public async checkMonitor(monitor: Monitor): Promise<Monitor> {
    if (monitor.status === 'PAUSED') return monitor;

    const startTime = Date.now();
    let isUp = false;
    let statusCode: number | null = null;
    let message = '';
    let latency = 0;

    const controller = new AbortController();
    const timeoutMs = (monitor.timeout || 5) * 1000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(monitor.url, {
        method: monitor.method || 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'UptimeMonitorLite/1.0 (512MB RAM Engine)',
          'Accept': '*/*'
        }
      });
      clearTimeout(timeoutId);

      latency = Date.now() - startTime;
      statusCode = response.status;

      const expected = monitor.expectedStatus || 200;
      const statusMatches = expected === 200 ? (statusCode >= 200 && statusCode < 400) : (statusCode === expected);

      if (!statusMatches) {
        isUp = false;
        message = `HTTP Status ${statusCode} (Esperado ${expected})`;
      } else if (monitor.keyword) {
        const text = await response.text();
        if (text.includes(monitor.keyword)) {
          isUp = true;
          message = `200 OK + Palabra clave encontrada`;
        } else {
          isUp = false;
          message = `Palabra clave "${monitor.keyword}" no encontrada`;
        }
      } else {
        isUp = true;
        message = `${statusCode} OK`;
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      latency = Date.now() - startTime;
      isUp = false;
      if (error.name === 'AbortError') {
        message = `Timeout agotado (${monitor.timeout}s)`;
      } else {
        message = error.message || 'Error de conexión';
      }
    }

    const previousStatus = monitor.status;
    const newStatus = isUp ? 'UP' : 'DOWN';
    const nowIso = new Date().toISOString();

    // Add heartbeat
    const newHeartbeat: Heartbeat = {
      id: `hb-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
      timestamp: nowIso,
      status: newStatus,
      latency,
      statusCode,
      message
    };

    monitor.heartbeats = [...(monitor.heartbeats || []), newHeartbeat].slice(-50); // Keep last 50 heartbeats
    monitor.lastCheck = nowIso;
    monitor.lastResponseTime = latency;
    monitor.lastStatusCode = statusCode;
    monitor.lastMessage = message;
    monitor.status = newStatus;

    // Recalculate 24h uptime based on heartbeats
    const totalHeartbeats = monitor.heartbeats.length;
    const upHeartbeats = monitor.heartbeats.filter(h => h.status === 'UP').length;
    monitor.uptime24h = totalHeartbeats > 0 ? Number(((upHeartbeats / totalHeartbeats) * 100).toFixed(2)) : 100;

    // State transition alerts
    if (previousStatus !== 'PENDING' && previousStatus !== newStatus) {
      if (newStatus === 'DOWN') {
        // Log incident
        const incident: Incident = {
          id: `inc-${Date.now()}`,
          monitorId: monitor.id,
          monitorName: monitor.name,
          startedAt: nowIso,
          resolvedAt: null,
          durationSeconds: null,
          reason: message
        };
        monitor.activeIncident = { startedAt: nowIso, reason: message };
        this.incidents.unshift(incident);
        this.saveIncidents();

        // Send Telegram alert
        if (this.telegramConfig.enabled && this.telegramConfig.notifyOnDown) {
          const alertMsg = `🔴 <b>[ALERTA CAÍDA] ${monitor.name}</b>\n\n` +
            `🔗 URL: <code>${monitor.url}</code>\n` +
            `⚠️ Motivo: <b>${message}</b>\n` +
            `⏱️ Latencia: ${latency}ms\n` +
            `📅 Fecha: ${new Date().toLocaleString('es-ES')}`;
          this.sendTelegramAlert(alertMsg).catch(err => console.error('Telegram alert error:', err));
        }
      } else if (newStatus === 'UP') {
        // Resolve incident
        if (monitor.activeIncident) {
          const started = new Date(monitor.activeIncident.startedAt).getTime();
          const duration = Math.round((Date.now() - started) / 1000);
          const inc = this.incidents.find(i => i.monitorId === monitor.id && !i.resolvedAt);
          if (inc) {
            inc.resolvedAt = nowIso;
            inc.durationSeconds = duration;
            this.saveIncidents();
          }
          monitor.activeIncident = null;
        }

        // Send Telegram recovery
        if (this.telegramConfig.enabled && this.telegramConfig.notifyOnRecovery) {
          const recMsg = `🟢 <b>[SERVICIO RECUPERADO] ${monitor.name}</b>\n\n` +
            `🔗 URL: <code>${monitor.url}</code>\n` +
            `✅ Estado: <b>${statusCode || 200} OK</b>\n` +
            `⚡ Latencia: ${latency}ms\n` +
            `📅 Fecha: ${new Date().toLocaleString('es-ES')}`;
          this.sendTelegramAlert(recMsg).catch(err => console.error('Telegram recovery error:', err));
        }
      }
    }

    this.saveMonitors();
    return monitor;
  }

  public getSystemStats(): SystemStats {
    const monitors = this.monitors;
    const upCount = monitors.filter(m => m.status === 'UP').length;
    const downCount = monitors.filter(m => m.status === 'DOWN').length;
    const pausedCount = monitors.filter(m => m.status === 'PAUSED').length;
    const totalCount = monitors.length;

    const overallUptime = totalCount > 0
      ? Number((monitors.reduce((acc, m) => acc + (m.uptime24h || 100), 0) / totalCount).toFixed(2))
      : 100;

    const activeLatencies = monitors
      .filter(m => m.status === 'UP' && typeof m.lastResponseTime === 'number')
      .map(m => m.lastResponseTime!);
    const avgLatency = activeLatencies.length > 0
      ? Math.round(activeLatencies.reduce((a, b) => a + b, 0) / activeLatencies.length)
      : 0;

    const memory = process.memoryUsage();
    const ramUsageMb = Math.round(memory.rss / (1024 * 1024));
    const uptimeSeconds = Math.round((Date.now() - this.startTime) / 1000);

    return {
      upCount,
      downCount,
      pausedCount,
      totalCount,
      overallUptime,
      avgLatency,
      ramUsageMb,
      uptimeSeconds
    };
  }
}

export const dataStore = new DataStore();
