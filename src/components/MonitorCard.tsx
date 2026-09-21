import React, { useState } from 'react';
import {
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Clock,
  Globe,
  Tag
} from 'lucide-react';
import type { Monitor } from '../types';
import { HeartbeatBar } from './HeartbeatBar';
import { LatencySparkline } from './LatencySparkline';

interface MonitorCardProps {
  monitor: Monitor;
  onCheckNow: (id: string) => Promise<void>;
  onTogglePause: (id: string) => Promise<void>;
  onEdit: (monitor: Monitor) => void;
  onDelete: (id: string) => Promise<void>;
}

export const MonitorCard: React.FC<MonitorCardProps> = ({
  monitor,
  onCheckNow,
  onTogglePause,
  onEdit,
  onDelete
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isUp = monitor.status === 'UP';
  const isDown = monitor.status === 'DOWN';
  const isPaused = monitor.status === 'PAUSED';

  const handleManualCheck = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsChecking(true);
    try {
      await onCheckNow(monitor.id);
    } finally {
      setIsChecking(false);
    }
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePause(monitor.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(monitor);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de eliminar el monitor "${monitor.name}"?`)) {
      onDelete(monitor.id);
    }
  };

  return (
    <div
      className={`rounded-xl transition-all duration-200 border ${
        isDown
          ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30'
          : isPaused
          ? 'bg-slate-900/50 border-slate-800 opacity-75'
          : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700/80 shadow-sm'
      }`}
    >
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Top row: Status indicator + Name + URL + Action icons */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Status light dot */}
            <div className="mt-1 relative flex-shrink-0 flex items-center justify-center w-3.5 h-3.5">
              {isUp && (
                <>
                  <span className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </>
              )}
              {isDown && (
                <>
                  <span className="absolute w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping opacity-80" />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-rose-500" />
                </>
              )}
              {isPaused && <span className="relative w-2.5 h-2.5 rounded-full bg-slate-500" />}
              {monitor.status === 'PENDING' && <span className="relative w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />}
            </div>

            {/* Name, Link & Tags */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {monitor.name}
                </h3>

                {/* Method badge */}
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700/60">
                  {monitor.method || 'GET'}
                </span>

                {/* Status badge */}
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                    isUp
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : isDown
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {monitor.status}
                </span>

                {/* Tags */}
                {(monitor.tags || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-slate-800/80 text-slate-400 rounded"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {t}
                  </span>
                ))}
              </div>

              {/* URL */}
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                <Globe className="w-3 h-3 text-slate-500 flex-shrink-0" />
                <a
                  href={monitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-emerald-400 transition underline-offset-2 hover:underline"
                >
                  {monitor.url}
                </a>
                <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Check now */}
            <button
              onClick={handleManualCheck}
              disabled={isChecking || isPaused}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 disabled:opacity-40"
              title="Verificar ahora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Pause / Play */}
            <button
              onClick={handlePause}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95"
              title={isPaused ? 'Reanudar monitoreo' : 'Pausar monitoreo'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {/* Edit */}
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95"
              title="Editar monitor"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition active:scale-95"
              title="Eliminar monitor"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Metrics Row: Last Ping Latency, Interval, Last status code */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/50 text-xs">
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Intervalo: <strong className="text-slate-200">{monitor.interval}s</strong>
            </span>
            <span>
              Latencia: <strong className={isDown ? 'text-rose-400' : 'text-emerald-400'}>
                {monitor.lastResponseTime ? `${monitor.lastResponseTime}ms` : '--'}
              </strong>
            </span>
            {monitor.lastStatusCode && (
              <span className="hidden sm:inline">
                Código: <strong className="text-slate-300">{monitor.lastStatusCode}</strong>
              </span>
            )}
          </div>

          {monitor.lastMessage && (
            <div className={`text-[11px] truncate max-w-xs font-mono ${isDown ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}>
              {monitor.lastMessage}
            </div>
          )}
        </div>

        {/* Heartbeats ticks bar */}
        <HeartbeatBar heartbeats={monitor.heartbeats} uptime24h={monitor.uptime24h} />

        {/* Toggle Details Chevron */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full pt-1 text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition"
        >
          <span>{isExpanded ? 'Ocultar gráfico de latencia' : 'Ver gráfico de latencia y detalles'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* Expanded Drawer */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-300">Curva de Latencia Reciente</span>
              <LatencySparkline heartbeats={monitor.heartbeats} />
            </div>

            {monitor.activeIncident && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Incidente en curso</span>
                </div>
                <p className="text-slate-300">{monitor.activeIncident.reason}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Iniciado a las {new Date(monitor.activeIncident.startedAt).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
