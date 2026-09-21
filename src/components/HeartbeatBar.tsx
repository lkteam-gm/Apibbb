import React, { useState } from 'react';
import type { Heartbeat } from '../types';

interface HeartbeatBarProps {
  heartbeats: Heartbeat[];
  uptime24h: number;
}

export const HeartbeatBar: React.FC<HeartbeatBarProps> = ({ heartbeats, uptime24h }) => {
  const [activeHb, setActiveHb] = useState<Heartbeat | null>(null);

  // Fill up to 40 bars
  const totalBars = 40;
  const recent = (heartbeats || []).slice(-totalBars);
  const paddingNeeded = Math.max(0, totalBars - recent.length);
  const displayBars: (Heartbeat | null)[] = [
    ...Array(paddingNeeded).fill(null),
    ...recent
  ];

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px] text-slate-400">Historial reciente</span>
        <span className="font-semibold text-emerald-400 font-mono text-[11px]">
          {uptime24h}% Uptime
        </span>
      </div>

      <div className="relative">
        {/* Heartbeat Ticks Bar */}
        <div className="flex items-center gap-[3px] sm:gap-[4px] h-6 sm:h-7 w-full p-1 bg-slate-900/80 rounded-lg border border-slate-800/80 overflow-hidden">
          {displayBars.map((hb, idx) => {
            if (!hb) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="flex-1 h-full rounded-[3px] bg-slate-800/40"
                  title="Sin datos aún"
                />
              );
            }

            const isUp = hb.status === 'UP';
            return (
              <button
                key={hb.id || idx}
                type="button"
                onMouseEnter={() => setActiveHb(hb)}
                onMouseLeave={() => setActiveHb(null)}
                onClick={() => setActiveHb(activeHb?.id === hb.id ? null : hb)}
                className={`flex-1 h-full rounded-[3px] transition-all duration-150 transform hover:scale-125 focus:outline-none ${
                  isUp
                    ? 'bg-emerald-500/85 hover:bg-emerald-400 hover:shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                    : 'bg-rose-500 hover:bg-rose-400 hover:shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-pulse'
                }`}
              />
            );
          })}
        </div>

        {/* Hover / Click Tooltip */}
        {activeHb && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap bg-slate-900 text-slate-100 text-xs px-2.5 py-1.5 rounded-md border border-slate-700 shadow-xl flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeHb.status === 'UP' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span className="font-medium">
              {activeHb.status === 'UP' ? 'Operativo' : 'Caído'}: {activeHb.latency}ms
            </span>
            <span className="text-slate-400 text-[10px] font-mono">
              {new Date(activeHb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
