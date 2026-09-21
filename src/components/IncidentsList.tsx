import React from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type { Incident } from '../types';

interface IncidentsListProps {
  incidents: Incident[];
}

export const IncidentsList: React.FC<IncidentsListProps> = ({ incidents }) => {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center text-xs text-slate-500">
        No se han registrado incidentes recientes. Todos los servicios funcionan correctamente.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {incidents.slice(0, 5).map(inc => {
        const isResolved = Boolean(inc.resolvedAt);

        return (
          <div
            key={inc.id}
            className={`p-3 sm:p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
              isResolved
                ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">
                {isResolved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{inc.monitorName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase font-mono ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isResolved ? 'Resuelto' : 'Activo'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{inc.reason}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono sm:text-right">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>
                  {new Date(inc.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {inc.durationSeconds && (
                <span className="text-slate-300">
                  Downtime: <strong>{inc.durationSeconds}s</strong>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
