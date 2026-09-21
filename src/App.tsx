import React, { useState, useEffect, useCallback } from 'react';
import type { Monitor, SystemStats, TelegramConfig, Incident } from './types';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { MonitorCard } from './components/MonitorCard';
import { MonitorModal } from './components/MonitorModal';
import { TelegramModal } from './components/TelegramModal';
import { PythonScriptModal } from './components/PythonScriptModal';
import { IncidentsList } from './components/IncidentsList';
import { Search, Plus, Filter, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UP' | 'DOWN' | 'PAUSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      const [monitorsRes, statsRes, tgRes, incRes] = await Promise.all([
        fetch('/api/monitors'),
        fetch('/api/stats'),
        fetch('/api/settings/telegram'),
        fetch('/api/incidents')
      ]);

      if (monitorsRes.ok) {
        const data = await monitorsRes.json();
        setMonitors(data);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (tgRes.ok) {
        const data = await tgRes.json();
        setTelegramConfig(data);
      }
      if (incRes.ok) {
        const data = await incRes.json();
        setIncidents(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    // Live polling every 8 seconds
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCheckNow = async (id: string) => {
    try {
      const res = await fetch(`/api/monitors/${id}/check`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setMonitors(prev => prev.map(m => (m.id === id ? updated : m)));
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePause = async (id: string) => {
    try {
      const res = await fetch(`/api/monitors/${id}/pause`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setMonitors(prev => prev.map(m => (m.id === id ? updated : m)));
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMonitor = async (id: string) => {
    try {
      const res = await fetch(`/api/monitors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMonitors(prev => prev.filter(m => m.id !== id));
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMonitor = async (data: Partial<Monitor>) => {
    if (editingMonitor) {
      const res = await fetch(`/api/monitors/${editingMonitor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error al actualizar el monitor');
    } else {
      const res = await fetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error al crear el monitor');
    }
    setEditingMonitor(null);
    fetchAllData();
  };

  const handleSaveTelegram = async (config: TelegramConfig) => {
    const res = await fetch('/api/settings/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Error al guardar configuración de Telegram');
    setTelegramConfig(config);
  };

  const handleTestTelegram = async (botToken: string, chatId: string) => {
    const res = await fetch('/api/settings/telegram/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botToken, chatId })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Fallo al contactar Telegram' };
    }
    return { success: true, message: data.message || 'Mensaje de prueba enviado exitosamente a Telegram' };
  };

  // Filtering
  const filteredMonitors = monitors.filter(m => {
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'UP'
        ? m.status === 'UP'
        : filter === 'DOWN'
        ? m.status === 'DOWN'
        : m.status === 'PAUSED';

    const matchesSearch =
      searchQuery.trim() === '' ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesFilter && matchesSearch;
  });

  const upCount = monitors.filter(m => m.status === 'UP').length;
  const downCount = monitors.filter(m => m.status === 'DOWN').length;
  const pausedCount = monitors.filter(m => m.status === 'PAUSED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <Header
        stats={stats}
        telegramConfig={telegramConfig}
        onOpenAddModal={() => {
          setEditingMonitor(null);
          setIsAddModalOpen(true);
        }}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onRefreshAll={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-7 space-y-6">
        {/* Metric Cards */}
        <StatsOverview stats={stats} monitors={monitors} />

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800/90 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                filter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({monitors.length})
            </button>
            <button
              onClick={() => setFilter('UP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                filter === 'UP'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Operativos ({upCount})</span>
            </button>
            <button
              onClick={() => setFilter('DOWN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                filter === 'DOWN'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Caídos ({downCount})</span>
            </button>
            <button
              onClick={() => setFilter('PAUSED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                filter === 'PAUSED'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pausados ({pausedCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, URL o tag..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>
        </div>

        {/* Monitors Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono text-slate-400">
              Monitores Activos ({filteredMonitors.length})
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Sondeo automático cada 30s
            </span>
          </div>

          {filteredMonitors.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">No se encontraron monitores</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No hay resultados que coincidan con tu búsqueda.'
                    : 'Añade tu primer endpoint o servidor para iniciar la supervisión.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingMonitor(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Monitor</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredMonitors.map(m => (
                <MonitorCard
                  key={m.id}
                  monitor={m}
                  onCheckNow={handleCheckNow}
                  onTogglePause={handleTogglePause}
                  onEdit={mon => {
                    setEditingMonitor(mon);
                    setIsAddModalOpen(true);
                  }}
                  onDelete={handleDeleteMonitor}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Incidents Section */}
        <section className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono text-slate-400">
              Registro de Incidentes y Caídas
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Notificaciones sincronizadas con Telegram
            </span>
          </div>
          <IncidentsList incidents={incidents} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="text-slate-400 font-semibold">Uptime Monitor</span> &bull; Diseñado con arquitectura ultra-ligera (&lt;30MB RAM) para VPS de 512MB &bull; Telegram Alerts
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Node / Python SQLite Engine &bull; Touch &amp; Mobile Optimized
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MonitorModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMonitor(null);
        }}
        onSave={handleSaveMonitor}
        editingMonitor={editingMonitor}
      />

      <TelegramModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        config={telegramConfig}
        onSave={handleSaveTelegram}
        onTest={handleTestTelegram}
      />

      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />
    </div>
  );
}
