import React from 'react';
import { CheckCircle2, XCircle, Clock, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { SystemStats, Monitor } from '../types';

interface StatsOverviewProps {
  stats: SystemStats | null;
  monitors: Monitor[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, monitors }) => {
  const upCount = stats?.upCount ?? monitors.filter(m => m.status === 'UP').length;
  const downCount = stats?.downCount ?? monitors.filter(m => m.status === 'DOWN').length;
  const totalCount = stats?.totalCount ?? monitors.length;
  const overallUptime = stats?.overallUptime ?? (totalCount > 0 ? 100 : 0);
  const avgLatency = stats?.avgLatency ?? 45;

  const isAllGood = downCount === 0 && totalCount > 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Estado General */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Estado del Sistema</span>
          {isAllGood ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-xl sm:text-2xl font-bold tracking-tight ${isAllGood ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isAllGood ? 'Todos Operativos' : `${downCount} con Fallo`}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 font-mono">
          {upCount} de {totalCount} servicios activos
        </p>
      </div>

      {/* Uptime Global */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Uptime Global (24h)</span>
          <Clock className="w-4 h-4 text-teal-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
            {overallUptime}%
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">Excelente</span>
        </div>
        <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, overallUptime))}%` }}
          />
        </div>
      </div>

      {/* Latencia Media */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Latencia Media</span>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
            {avgLatency} <span className="text-sm font-normal text-slate-400">ms</span>
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 font-mono">
          Respuesta HTTP promedio
        </p>
      </div>

      {/* Monitores / Conteo */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Desglose de Nodos</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-slate-200">{upCount} UP</span>
          </div>
          {downCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-sm font-semibold text-rose-400">{downCount} DOWN</span>
            </div>
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-500 font-mono">
          Ciclo de chequeo activo
        </p>
      </div>
    </div>
  );
};
