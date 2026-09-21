import React, { useState, useEffect } from 'react';
import { X, Send, Check, ShieldAlert, Sparkles, HelpCircle, BellRing } from 'lucide-react';
import type { TelegramConfig } from '../types';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig | null;
  onSave: (config: TelegramConfig) => Promise<void>;
  onTest: (botToken: string, chatId: string) => Promise<{ success: boolean; message: string }>;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onTest
}) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [notifyOnDown, setNotifyOnDown] = useState(true);
  const [notifyOnRecovery, setNotifyOnRecovery] = useState(true);

  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (config) {
      setBotToken(config.botToken || '');
      setChatId(config.chatId || '');
      setEnabled(config.enabled ?? true);
      setNotifyOnDown(config.notifyOnDown ?? true);
      setNotifyOnRecovery(config.notifyOnRecovery ?? true);
    }
    setTestResult(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleTestAlert = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTestResult({
        success: false,
        message: 'Por favor ingresa primero el Bot Token y el Chat ID'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTest(botToken.trim(), chatId.trim());
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Error al conectar con Telegram' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        botToken: botToken.trim(),
        chatId: chatId.trim(),
        enabled,
        notifyOnDown,
        notifyOnRecovery
      });
      onClose();
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Error al guardar' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Alertas vía Telegram
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Notificaciones instantáneas al caerse o recuperarse un servicio
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

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Quick Instructions Toggle */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full text-left p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2 font-medium">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              ¿Cómo crear tu Bot de Telegram en 1 minuto?
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              {showInstructions ? 'Ocultar' : 'Ver pasos'}
            </span>
          </button>

          {showInstructions && (
            <div className="mt-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-2">
              <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                <li>
                  Abre Telegram y busca <strong className="text-blue-400">@BotFather</strong>.
                </li>
                <li>
                  Envía el comando <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">/newbot</code>, asígnale un nombre y copia el <strong className="text-slate-200">HTTP API Token</strong>.
                </li>
                <li>
                  Busca <strong className="text-blue-400">@userinfobot</strong> en Telegram para obtener tu <strong className="text-slate-200">Id numérico</strong> (Chat ID).
                </li>
                <li>
                  Inicia conversación con tu bot haciendo clic en <strong className="text-emerald-400">Iniciar (Start)</strong> para que tenga permiso de enviarte mensajes.
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Form */}
        <form id="form-telegram" onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          {/* Bot Token */}
          <div>
            <label htmlFor="input-telegram-bot-token" className="block text-slate-300 font-medium mb-1">
              Telegram Bot Token <span className="text-emerald-400">*</span>
            </label>
            <input
              id="input-telegram-bot-token"
              type="text"
              required
              value={botToken}
              onChange={e => setBotToken(e.target.value)}
              placeholder="1234567890:AAF_xxxxxxx..."
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600 text-xs font-mono outline-none transition"
            />
          </div>

          {/* Chat ID */}
          <div>
            <label htmlFor="input-telegram-chat-id" className="block text-slate-300 font-medium mb-1">
              Chat ID (Personal o Canal) <span className="text-emerald-400">*</span>
            </label>
            <input
              id="input-telegram-chat-id"
              type="text"
              required
              value={chatId}
              onChange={e => setChatId(e.target.value)}
              placeholder="p. ej. 987654321 o -100123456789"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600 text-xs font-mono outline-none transition"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-800/40">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <BellRing className="w-3.5 h-3.5 text-rose-400" />
                Alertar cuando un servicio caiga (DOWN)
              </span>
              <input
                id="checkbox-notify-down"
                type="checkbox"
                checked={notifyOnDown}
                onChange={e => setNotifyOnDown(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-800/40">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Alertar cuando el servicio se recupere (UP)
              </span>
              <input
                id="checkbox-notify-recovery"
                type="checkbox"
                checked={notifyOnRecovery}
                onChange={e => setNotifyOnRecovery(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            {/* Test button */}
            <button
              id="btn-telegram-test"
              type="button"
              onClick={handleTestAlert}
              disabled={isTesting || !botToken || !chatId}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-medium transition disabled:opacity-40"
            >
              <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse' : ''}`} />
              <span>{isTesting ? 'Enviando prueba...' : 'Enviar Alerta de Prueba'}</span>
            </button>

            <div className="w-full sm:w-auto flex items-center justify-end gap-2">
              <button
                id="btn-telegram-cancel"
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
              >
                Cerrar
              </button>
              <button
                id="btn-telegram-save"
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-950 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Configuración'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
