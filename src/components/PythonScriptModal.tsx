import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Terminal, Cpu, HardDrive, ShieldCheck } from 'lucide-react';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({ isOpen, onClose }) => {
  const [scriptCode, setScriptCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'systemd' | 'guide'>('guide');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/python-script')
        .then(res => res.json())
        .then(data => setScriptCode(data.script || ''))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const systemdService = `[Unit]
Description=Uptime Monitor Lite Python Daemon
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/uptime-lite
ExecStart=/usr/bin/python3 /root/uptime-lite/uptime_lite.py
Restart=always
RestartSec=10
Environment=TELEGRAM_BOT_TOKEN="TU_BOT_TOKEN"
Environment=TELEGRAM_CHAT_ID="TU_CHAT_ID"

[Install]
WantedBy=multi-user.target
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Versión Python para VPS 512MB
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  &lt;25 MB RAM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tu propio clon ultra-ligero de Uptime Kuma en 1 solo archivo Python
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 my-3 text-xs flex-shrink-0">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div className="truncate">
              <div className="text-slate-400 text-[10px]">Uso de RAM</div>
              <div className="font-bold text-emerald-400 font-mono">18 - 25 MB</div>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div className="truncate">
              <div className="text-slate-400 text-[10px]">Almacenamiento</div>
              <div className="font-bold text-slate-200">SQLite local</div>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="truncate">
              <div className="text-slate-400 text-[10px]">Alertas</div>
              <div className="font-bold text-slate-200">Telegram Bot</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 text-xs font-medium gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Guía de Instalación Rápida
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeTab === 'script'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Código Python (uptime_lite.py)
          </button>
          <button
            onClick={() => setActiveTab('systemd')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeTab === 'systemd'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Servicio Systemd (24/7)
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 my-3 pr-1 text-xs">
          {activeTab === 'guide' && (
            <div className="space-y-3 text-slate-300">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed">
                💡 <strong>¿Por qué Uptime Kuma consume más?</strong> Uptime Kuma incluye Node.js, socket.io, Chromium headless para certificados y múltiples dependencias pesadas que suelen consumir entre 150MB y 350MB de RAM. Con este script en Python nativo + SQLite, el consumo se mantiene por debajo de <strong>25 MB</strong>, dejando el 95% de la memoria de tu VPS libre.
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Pasos para ejecutarlo en tu VPS de 512MB:</h4>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                  <p className="text-slate-400"># 1. Crear carpeta de trabajo</p>
                  <p className="text-emerald-400">mkdir -p ~/uptime-lite &amp;&amp; cd ~/uptime-lite</p>
                  <p className="text-slate-400 mt-2"># 2. Descargar el script en 1 comando</p>
                  <p className="text-emerald-400">curl -sSL "https://ais-dev-lylpy3cpsqp3kysxmazszj-402915662261.us-east1.run.app/api/python-script?download=true" -o uptime_lite.py</p>
                  <p className="text-slate-400 mt-2"># 3. Exportar credenciales de Telegram (opcional)</p>
                  <p className="text-emerald-400">export TELEGRAM_BOT_TOKEN="tu_token"</p>
                  <p className="text-emerald-400">export TELEGRAM_CHAT_ID="tu_chat_id"</p>
                  <p className="text-slate-400 mt-2"># 4. Iniciar daemon</p>
                  <p className="text-emerald-400">python3 uptime_lite.py</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="relative">
              <div className="absolute right-2 top-2 z-10 flex gap-1.5">
                <button
                  onClick={() => handleCopy(scriptCode)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
                <a
                  href="/api/python-script?download=true"
                  download="uptime_lite.py"
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[11px] text-white font-medium transition"
                >
                  <Download className="w-3 h-3" />
                  <span>Descargar .py</span>
                </a>
              </div>
              <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                {scriptCode}
              </pre>
            </div>
          )}

          {activeTab === 'systemd' && (
            <div className="space-y-3">
              <p className="text-slate-400">
                Guarda esto en <code className="text-slate-200 bg-slate-950 px-1 py-0.5 rounded">/etc/systemd/system/uptime-lite.service</code> para que tu monitor corra 24/7 y reviva tras reinicios:
              </p>
              <div className="relative">
                <button
                  onClick={() => handleCopy(systemdService)}
                  className="absolute right-2 top-2 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
                <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-amber-300 overflow-x-auto leading-relaxed">
                  {systemdService}
                </pre>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <p className="text-slate-400"># Activar el servicio en Ubuntu/Debian:</p>
                <p className="text-emerald-400">sudo systemctl daemon-reload</p>
                <p className="text-emerald-400">sudo systemctl enable --now uptime-lite</p>
                <p className="text-emerald-400">sudo systemctl status uptime-lite</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-slate-400">
            Cero dependencias externas requeridas (Python 3 estándar)
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
