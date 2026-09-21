import React from 'react';
import type { Heartbeat } from '../types';

interface LatencySparklineProps {
  heartbeats: Heartbeat[];
}

export const LatencySparkline: React.FC<LatencySparklineProps> = ({ heartbeats }) => {
  const validHeartbeats = (heartbeats || []).filter(h => h.status === 'UP');
  if (validHeartbeats.length < 2) {
    return (
      <div className="h-16 flex items-center justify-center text-xs text-slate-500 italic">
        Recolectando datos de latencia...
      </div>
    );
  }

  const latencies = validHeartbeats.map(h => h.latency);
  const min = Math.min(...latencies);
  const max = Math.max(...latencies, min + 10);
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

  const height = 48;
  const width = 280;

  const points = latencies.map((val, idx) => {
    const x = (idx / (latencies.length - 1)) * width;
    const y = height - ((val - min) / (max - min || 1)) * (height - 12) - 6;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Min: {min}ms</span>
        <span className="text-emerald-400 font-semibold">Media: {avg}ms</span>
        <span>Max: {max}ms</span>
      </div>

      <div className="w-full bg-slate-950/60 rounded-md p-1 border border-slate-800/60">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-12 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#latencyGradient)"
          />
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    </div>
  );
};
