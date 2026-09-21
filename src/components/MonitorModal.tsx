import React, { useState, useEffect } from 'react';
import { X, Check, Globe, Clock, ShieldAlert, Tag, Hash } from 'lucide-react';
import type { Monitor } from '../types';

interface MonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (monitorData: Partial<Monitor>) => Promise<void>;
  editingMonitor: Monitor | null;
}

export const MonitorModal: React.FC<MonitorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMonitor
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'HEAD'>('GET');
  const [interval, setInterval] = useState(30);
  const [timeout, setTimeout] = useState(5);
  const [expectedStatus, setExpectedStatus] = useState(200);
  const [keyword, setKeyword] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingMonitor) {
      setName(editingMonitor.name);
      setUrl(editingMonitor.url);
      setMethod(editingMonitor.method || 'GET');
      setInterval(editingMonitor.interval || 30);
      setTimeout(editingMonitor.timeout || 5);
      setExpectedStatus(editingMonitor.expectedStatus || 200);
      setKeyword(editingMonitor.keyword || '');
      setTagsInput((editingMonitor.tags || []).join(', '));
    } else {
      setName('');
      setUrl('https://');
      setMethod('GET');
      setInterval(30);
      setTimeout(5);
      setExpectedStatus(200);
      setKeyword('');
      setTagsInput('');
    }
    setError(null);
  }, [editingMonitor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor indica un nombre para el monitor');
      return;
    }
    if (!url.trim() || !url.startsWith('http')) {
      setError('Por favor introduce una URL válida comenzando con http:// o https://');
      return;
    }

    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await onSave({
        name: name.trim(),
        url: url.trim(),
        method,
        interval: Number(interval),
        timeout: Number(timeout),
        expectedStatus: Number(expectedStatus),
        keyword: keyword.trim() || undefined,
        tags
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el monitor');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {editingMonitor ? 'Editar Monitor' : 'Nuevo Monitor de Servicio'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configura los parámetros de sondeo HTTP/HTTPS
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form id="form-monitor" onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Nombre */}
          <div>
            <label htmlFor="input-monitor-name" className="block text-slate-300 font-medium mb-1">
              Nombre del Monitor <span className="text-emerald-400">*</span>
            </label>
            <input
              id="input-monitor-name"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="p. ej. Servidor Producción VPS"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500 text-sm outline-none transition"
            />
          </div>

          {/* URL & Method */}
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <label htmlFor="select-monitor-method" className="block text-slate-300 font-medium mb-1">
                Método
              </label>
              <select
                id="select-monitor-method"
                value={method}
                onChange={e => setMethod(e.target.value as any)}
                className="w-full px-2.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none"
              >
                <option value="GET">GET</option>
                <option value="HEAD">HEAD</option>
                <option value="POST">POST</option>
              </select>
            </div>
            <div className="col-span-3">
              <label htmlFor="input-monitor-url" className="block text-slate-300 font-medium mb-1">
                URL de Verificación <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  id="input-monitor-url"
                  type="url"
                  required
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://tu-dominio.com/health"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500 text-sm outline-none transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Interval & Timeout */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="select-monitor-interval" className="block text-slate-300 font-medium mb-1">
                Intervalo de Comprobación
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <select
                  id="select-monitor-interval"
                  value={interval}
                  onChange={e => setInterval(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none"
                >
                  <option value={15}>Cada 15 segundos</option>
                  <option value={30}>Cada 30 segundos (recomendado)</option>
                  <option value={60}>Cada 60 segundos (1 min)</option>
                  <option value={120}>Cada 2 minutos</option>
                  <option value={300}>Cada 5 minutos</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="select-monitor-timeout" className="block text-slate-300 font-medium mb-1">
                Timeout Máximo
              </label>
              <select
                id="select-monitor-timeout"
                value={timeout}
                onChange={e => setTimeout(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none"
              >
                <option value={3}>3 segundos</option>
                <option value={5}>5 segundos (estándar)</option>
                <option value={10}>10 segundos</option>
                <option value={15}>15 segundos</option>
              </select>
            </div>
          </div>

          {/* Expected Status & Keyword */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-monitor-expected-status" className="block text-slate-300 font-medium mb-1">
                Código HTTP Esperado
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  id="input-monitor-expected-status"
                  type="number"
                  value={expectedStatus}
                  onChange={e => setExpectedStatus(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="input-monitor-keyword" className="block text-slate-300 font-medium mb-1">
                Palabra Clave (Opcional)
              </label>
              <input
                id="input-monitor-keyword"
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="p. ej. ok o pong"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="input-monitor-tags" className="block text-slate-300 font-medium mb-1">
              Etiquetas (separadas por coma)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                id="input-monitor-tags"
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="p. ej. VPS 512MB, API, Backend"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              id="btn-monitor-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              Cancelar
            </button>
            <button
              id="btn-monitor-submit"
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs shadow-lg shadow-emerald-950 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : editingMonitor ? 'Actualizar Monitor' : 'Crear Monitor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
