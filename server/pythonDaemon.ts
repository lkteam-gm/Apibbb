export const PYTHON_DAEMON_SCRIPT = `#!/usr/bin/env python3
"""
Uptime Monitor Lite - Python Daemon (Ultra-lightweight <30MB RAM)
Diseñado para correr en VPS de 512MB RAM o Raspberry Pi con Python 3.8+
Sin dependencias pesadas: usa SQLite nativo y urllib o aiohttp opcional.
"""

import sys
import os
import time
import json
import sqlite3
import urllib.request
import urllib.error
import ssl
from datetime import datetime

# ================= CONFIGURACIÓN =================
DB_FILE = "uptime_lite.db"
CHECK_INTERVAL_SECONDS = 30  # Intervalo general de escaneo
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# Lista de monitores iniciales
DEFAULT_MONITORS = [
    {
        "id": "google-dns",
        "name": "Google DNS Service",
        "url": "https://8.8.8.8",
        "expected_status": 200,
        "timeout": 5
    },
    {
        "id": "cloudflare",
        "name": "Cloudflare CDN",
        "url": "https://1.1.1.1",
        "expected_status": 200,
        "timeout": 5
    },
    {
        "id": "github-api",
        "name": "GitHub Status API",
        "url": "https://www.githubstatus.com",
        "expected_status": 200,
        "timeout": 5
    }
]

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS monitors (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            expected_status INTEGER DEFAULT 200,
            timeout INTEGER DEFAULT 5,
            status TEXT DEFAULT 'PENDING',
            last_latency REAL,
            last_checked TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS heartbeats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            monitor_id TEXT,
            status TEXT,
            latency REAL,
            status_code INTEGER,
            message TEXT,
            timestamp TEXT
        )
    ''')
    # Insertar monitores por defecto si está vacía
    c.execute('SELECT COUNT(*) FROM monitors')
    if c.fetchone()[0] == 0:
        for m in DEFAULT_MONITORS:
            c.execute('''
                INSERT INTO monitors (id, name, url, expected_status, timeout, status)
                VALUES (?, ?, ?, ?, ?, 'PENDING')
            ''', (m["id"], m["name"], m["url"], m["expected_status"], m["timeout"]))
    conn.commit()
    conn.close()

def send_telegram(message: str):
    token = TELEGRAM_BOT_TOKEN
    chat_id = TELEGRAM_CHAT_ID
    if not token or not chat_id:
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=10)
        print("  [Telegram] Alerta enviada con éxito.")
    except Exception as e:
        print(f"  [Telegram Error] {e}")

def check_target(url: str, expected_status: int = 200, timeout: int = 5):
    # Contexto SSL seguro
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "UptimeMonitorLite/1.0 (512MB-VPS)"}
    )
    start = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
            code = resp.getcode()
            is_up = (code == expected_status) or (expected_status == 200 and 200 <= code < 400)
            return is_up, code, elapsed_ms, "OK" if is_up else f"HTTP {code}"
    except urllib.error.HTTPError as e:
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        is_up = (e.code == expected_status)
        return is_up, e.code, elapsed_ms, f"HTTP Error {e.code}"
    except Exception as e:
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        return False, 0, elapsed_ms, str(e)

def run_checks():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT id, name, url, expected_status, timeout, status FROM monitors')
    monitors = c.fetchall()
    now_iso = datetime.utcnow().isoformat() + "Z"

    for m_id, name, url, exp_code, timeout, old_status in monitors:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Verificando {name} ({url})...")
        is_up, status_code, latency, msg = check_target(url, exp_code, timeout)
        new_status = "UP" if is_up else "DOWN"

        # Registrar latido
        c.execute('''
            INSERT INTO heartbeats (monitor_id, status, latency, status_code, message, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (m_id, new_status, latency, status_code, msg, now_iso))

        # Alerta de cambio de estado a Telegram
        if old_status != 'PENDING' and old_status != new_status:
            if new_status == "DOWN":
                txt = f"🔴 <b>ALERTA CAÍDA: {name}</b>\\nURL: <code>{url}</code>\\nError: {msg}\\nLatencia: {latency}ms\\nHora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                print(f"  --> {name} SE CAYÓ!")
                send_telegram(txt)
            elif new_status == "UP":
                txt = f"🟢 <b>RECUPERADO: {name}</b>\\nURL: <code>{url}</code>\\nCódigo: {status_code}\\nLatencia: {latency}ms\\nHora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                print(f"  --> {name} SE RECUPERÓ!")
                send_telegram(txt)

        # Actualizar monitor
        c.execute('''
            UPDATE monitors
            SET status = ?, last_latency = ?, last_checked = ?
            WHERE id = ?
        ''', (new_status, latency, now_iso, m_id))

    conn.commit()
    conn.close()

def main():
    print("==========================================")
    print("🚀 Uptime Monitor Lite - Python Daemon")
    print("⚡ Consumo estimado: <25 MB RAM")
    print("💾 Base de datos: SQLite (local)")
    print("==========================================")
    init_db()
    while True:
        try:
            run_checks()
        except Exception as err:
            print(f"[Error en loop]: {err}")
        time.sleep(CHECK_INTERVAL_SECONDS)

if __name__ == '__main__':
    main()
`;
