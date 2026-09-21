import React from 'react';
import { Activity, Plus, Send, Terminal, RefreshCw, Server, Cpu } from 'lucide-react';
import type { TelegramConfig, SystemStats } from '../types';

interface HeaderProps {
  stats: SystemStats | null;
  telegramConfig: TelegramConfig | null;
  onOpenAddModal: () => void;
  onOpenTelegramModal: () => void;
  onOpenPythonModal: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  telegramConfig,
  onOpenAddModal,
  onOpenTelegramModal,
  onOpenPythonModal,
  onRefreshAll,
  isRefreshing
}) => {
  const ramMb = stats?.ramUsageMb || 28;
  const isTelegramConfigured = Boolean(telegramConfig?.enabled && telegramConfig?.botToken);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Logo and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Uptime Monitor
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Lite 512MB
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monitoreo continuo en tiempo real & alertas vía Telegram
              </p>
            </div>
          </div>

          {/* Quick Refresh Icon on mobile */}
          <button
            id="btn-mobile-refresh"
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="sm:hidden p-2 text-slate-400 hover:text-slate-200 active:scale-95 transition"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* RAM Footprint Badge */}
          <div
            id="badge-ram-indicator"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300"
            title="Consumo de RAM optimizado para VPS de 512MB"
          >
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>RAM: <strong className="text-emerald-400">{ramMb} MB</strong> / 512MB</span>
          </div>

          {/* Telegram Alerts Trigger */}
          <button
            id="btn-header-telegram"
            onClick={onOpenTelegramModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition active:scale-95 ${
              isTelegramConfigured
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram</span>
            {isTelegramConfigured ? (
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            )}
          </button>

          {/* Python 512MB Daemon Modal Trigger */}
          <button
            id="btn-header-python-daemon"
            onClick={onOpenPythonModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-medium text-amber-300/90 hover:text-amber-200 transition active:scale-95"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Daemon Python</span>
            <span className="sm:hidden">Python</span>
          </button>

          {/* Refresh Desktop Button */}
          <button
            id="btn-header-refresh"
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition active:scale-95"
            title="Refrescar estado de todos los monitores"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Actualizar</span>
          </button>

          {/* Add Monitor Primary Button */}
          <button
            id="btn-header-add-monitor"
            onClick={onOpenAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-xs font-semibold text-white shadow-lg shadow-emerald-950 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Monitor</span>
          </button>
        </div>
      </div>
    </header>
  );
};
