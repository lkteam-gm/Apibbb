import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dataStore } from './server/dataStore';
import { PYTHON_DAEMON_SCRIPT } from './server/pythonDaemon';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === API ENDPOINTS ===

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all monitors
  app.get('/api/monitors', (req, res) => {
    res.json(dataStore.getMonitors());
  });

  // Create new monitor
  app.post('/api/monitors', async (req, res) => {
    try {
      const monitor = dataStore.addMonitor(req.body);
      // Trigger initial check immediately
      dataStore.checkMonitor(monitor).catch(console.error);
      res.status(201).json(monitor);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update monitor
  app.put('/api/monitors/:id', (req, res) => {
    const updated = dataStore.updateMonitor(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Monitor no encontrado' });
    }
    res.json(updated);
  });

  // Delete monitor
  app.delete('/api/monitors/:id', (req, res) => {
    const deleted = dataStore.deleteMonitor(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Monitor no encontrado' });
    }
    res.json({ success: true, id: req.params.id });
  });

  // Manually check a monitor immediately
  app.post('/api/monitors/:id/check', async (req, res) => {
    const monitor = dataStore.getMonitor(req.params.id);
    if (!monitor) {
      return res.status(404).json({ error: 'Monitor no encontrado' });
    }
    const updated = await dataStore.checkMonitor(monitor);
    res.json(updated);
  });

  // Toggle pause/resume monitor
  app.post('/api/monitors/:id/pause', (req, res) => {
    const updated = dataStore.togglePause(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Monitor no encontrado' });
    }
    res.json(updated);
  });

  // Get incident history
  app.get('/api/incidents', (req, res) => {
    res.json(dataStore.getIncidents());
  });

  // Telegram settings
  app.get('/api/settings/telegram', (req, res) => {
    const config = dataStore.getTelegramConfig();
    // Return sanitized or full for personal dashboard
    res.json(config);
  });

  app.post('/api/settings/telegram', (req, res) => {
    const updated = dataStore.updateTelegramConfig(req.body);
    res.json(updated);
  });

  // Test Telegram notification
  app.post('/api/settings/telegram/test', async (req, res) => {
    const { botToken, chatId } = req.body;
    if (botToken && chatId) {
      // Temporarily update or test with provided tokens
      dataStore.updateTelegramConfig({ botToken, chatId, enabled: true });
    }
    const testMessage = `🤖 <b>[TEST NOTIFICACIÓN] Uptime Monitor</b>\n\n` +
      `🚀 Tu conexión con Telegram está funcionando a la perfección!\n` +
      `⚡ Memoria usada por el motor: <b>${Math.round(process.memoryUsage().rss / 1048576)} MB</b> (Apto para VPS 512MB)\n` +
      `🕒 Fecha de prueba: ${new Date().toLocaleString('es-ES')}`;

    const result = await dataStore.sendTelegramAlert(testMessage);
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  });

  // System stats & RAM usage
  app.get('/api/stats', (req, res) => {
    res.json(dataStore.getSystemStats());
  });

  // Standalone Python Daemon Script download/view
  app.get('/api/python-script', (req, res) => {
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', 'attachment; filename="uptime_lite.py"');
      res.setHeader('Content-Type', 'text/x-python');
      return res.send(PYTHON_DAEMON_SCRIPT);
    }
    res.json({ script: PYTHON_DAEMON_SCRIPT });
  });

  // === BACKGROUND MONITORING WORKER ===
  // Lightweight interval checker running every 5 seconds to scan scheduled monitors
  setInterval(async () => {
    try {
      const monitors = dataStore.getMonitors();
      const now = Date.now();

      for (const monitor of monitors) {
        if (monitor.status === 'PAUSED') continue;

        const lastCheckTime = monitor.lastCheck ? new Date(monitor.lastCheck).getTime() : 0;
        const intervalMs = (monitor.interval || 30) * 1000;

        if (now - lastCheckTime >= intervalMs) {
          // Check this monitor asynchronously
          dataStore.checkMonitor(monitor).catch(err => {
            console.error(`Error checking monitor ${monitor.name}:`, err.message);
          });
        }
      }
    } catch (e: any) {
      console.error('Background worker error:', e.message);
    }
  }, 5000);

  // === VITE / STATIC SERVING ===
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Uptime Monitor running at http://0.0.0.0:${PORT}`);
    console.log(`RAM footprint on boot: ${Math.round(process.memoryUsage().rss / 1048576)} MB`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
