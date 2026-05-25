#!/usr/bin/env python3
"""Local static server for the foodnme spec viewer.

Usage:
    ./viewer/serve.py                # foreground (Ctrl+C to stop)
    ./viewer/serve.py start          # background, returns immediately
    ./viewer/serve.py stop           # kills the backgrounded server
    ./viewer/serve.py status         # shows whether it's running

Serves the project root over HTTP so the viewer can fetch ../stories/ and
../design/ relative paths. Negotiates a free port starting at 8000.
"""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import socket
import subprocess
import sys
import time
import webbrowser

PORT_START = 8000
PORT_END = 8050
HOST = "127.0.0.1"
PROJECT_ROOT = Path(__file__).resolve().parent.parent  # plan/ — exposes viewer/, stories/, design/, *.md as siblings

# Background-mode state files. /tmp survives a session, clears on reboot —
# stale state self-heals.
PID_FILE = Path("/tmp/foodnme-serve.pid")
PORT_FILE = Path("/tmp/foodnme-serve.port")
LOG_FILE = Path("/tmp/foodnme-serve.log")


# ───────────────────── port + serve primitives ─────────────────────

def first_free_port(start, end):
    """Return the first port in [start, end] we can bind on HOST."""
    for port in range(start, end + 1):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind((HOST, port))
        except OSError:
            s.close()
            continue
        s.close()
        return port
    return None


class NoCacheHandler(SimpleHTTPRequestHandler):
    """Serve files with caching disabled.

    Plain SimpleHTTPRequestHandler sends no Cache-Control, so browsers apply
    heuristic caching and keep showing stale stories/INDEX.md (and viewer.jsx)
    even after the server restarts. For a localhost spec browser we always want
    fresh content, so force revalidation on every response.
    """

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


def serve_blocking(port, open_browser=True):
    """Bind and serve on `port`. Blocks until Ctrl+C or termination signal."""
    os.chdir(PROJECT_ROOT)
    url = f"http://localhost:{port}/viewer/"
    print(f"→ Project root: {PROJECT_ROOT}", flush=True)
    print(f"→ Serving at   {url}", flush=True)
    if port != PORT_START:
        print(f"  (port {PORT_START} was busy, fell through to {port})", flush=True)
    print("→ Ctrl+C to stop", flush=True)

    if open_browser:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    server = ThreadingHTTPServer((HOST, port), NoCacheHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n→ Stopped.", flush=True)
    finally:
        server.server_close()


# ───────────────────── PID file helpers ─────────────────────

def read_pid():
    if not PID_FILE.exists():
        return None
    try:
        return int(PID_FILE.read_text().strip())
    except (ValueError, OSError):
        return None


def pid_alive(pid):
    if pid is None:
        return False
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        # Process exists but is owned by someone else — treat as alive.
        return True
    return True


def clear_state():
    for p in (PID_FILE, PORT_FILE):
        try:
            p.unlink()
        except FileNotFoundError:
            pass


# ───────────────────── subcommands ─────────────────────

def cmd_foreground():
    """No args: run in the foreground (current default behavior)."""
    port = first_free_port(PORT_START, PORT_END)
    if port is None:
        print(f"No free port in {PORT_START}-{PORT_END}.", file=sys.stderr)
        return 1
    serve_blocking(port, open_browser=True)
    return 0


def cmd_start():
    """Daemonize: fork a detached child that serves; parent prints URL and exits."""
    existing = read_pid()
    if pid_alive(existing):
        port = PORT_FILE.read_text().strip() if PORT_FILE.exists() else "?"
        print(f"Already running. pid={existing} port={port}", file=sys.stderr)
        print(f"  URL: http://localhost:{port}/viewer/", file=sys.stderr)
        print("  Use `./viewer/serve.py stop` to stop it.", file=sys.stderr)
        return 1
    if existing is not None:
        # Stale PID file from a previous run — clean it up.
        clear_state()

    port = first_free_port(PORT_START, PORT_END)
    if port is None:
        print(f"No free port in {PORT_START}-{PORT_END}.", file=sys.stderr)
        return 1

    log_fd = open(LOG_FILE, "a", buffering=1)  # line-buffered
    log_fd.write(f"\n--- started at {time.strftime('%Y-%m-%d %H:%M:%S')} on port {port} ---\n")
    proc = subprocess.Popen(
        [sys.executable, str(Path(__file__).resolve()), "--child", str(port)],
        stdout=log_fd,
        stderr=log_fd,
        stdin=subprocess.DEVNULL,
        start_new_session=True,
        close_fds=True,
    )
    PID_FILE.write_text(str(proc.pid))
    PORT_FILE.write_text(str(port))

    # Give the child a moment to actually bind and confirm it stuck.
    time.sleep(0.3)
    if proc.poll() is not None:
        # Child died immediately — surface the log.
        clear_state()
        print(f"Child exited with code {proc.returncode}. Recent log:", file=sys.stderr)
        try:
            print(LOG_FILE.read_text()[-500:], file=sys.stderr)
        except OSError:
            pass
        return 1

    url = f"http://localhost:{port}/viewer/"
    print(f"→ Started in background.  pid={proc.pid}  port={port}")
    print(f"→ {url}")
    if port != PORT_START:
        print(f"  (port {PORT_START} was busy, fell through to {port})")
    print(f"→ Logs: {LOG_FILE}")
    print("→ Stop: ./viewer/serve.py stop")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    return 0


def cmd_stop():
    pid = read_pid()
    if pid is None:
        print("Not running (no pid file).")
        return 0
    if not pid_alive(pid):
        print(f"Stale pid file (pid={pid} not alive). Cleaning up.")
        clear_state()
        return 0
    try:
        os.kill(pid, 15)  # SIGTERM
    except ProcessLookupError:
        clear_state()
        print("Process gone before signal arrived. Cleaned up.")
        return 0
    # Give it up to 2 s to exit cleanly.
    for _ in range(20):
        if not pid_alive(pid):
            break
        time.sleep(0.1)
    if pid_alive(pid):
        print(f"pid={pid} didn't exit on SIGTERM, sending SIGKILL.")
        try:
            os.kill(pid, 9)
        except ProcessLookupError:
            pass
        time.sleep(0.2)
    clear_state()
    print(f"→ Stopped. pid={pid}")
    return 0


def cmd_status():
    pid = read_pid()
    if not pid_alive(pid):
        if pid is not None:
            print(f"Not running. (Stale pid={pid} found — run `stop` to clean up.)")
        else:
            print("Not running.")
        return 0
    port = PORT_FILE.read_text().strip() if PORT_FILE.exists() else "?"
    print(f"Running. pid={pid}  port={port}")
    print(f"  URL:  http://localhost:{port}/viewer/")
    print(f"  Logs: {LOG_FILE}")
    return 0


def cmd_child(port_arg):
    """Hidden subcommand: serve on the given port without opening a browser.

    Invoked by `start` after it picks the port and detaches.
    """
    try:
        port = int(port_arg)
    except (TypeError, ValueError):
        print(f"--child: invalid port {port_arg!r}", file=sys.stderr)
        return 2
    serve_blocking(port, open_browser=False)
    return 0


# ───────────────────── dispatch ─────────────────────

def main(argv):
    if len(argv) == 1:
        return cmd_foreground()
    sub = argv[1]
    if sub == "start":
        return cmd_start()
    if sub == "stop":
        return cmd_stop()
    if sub in ("status", "ps"):
        return cmd_status()
    if sub == "--child":
        return cmd_child(argv[2] if len(argv) > 2 else None)
    if sub in ("-h", "--help", "help"):
        print(__doc__)
        return 0
    print(f"Unknown subcommand: {sub}", file=sys.stderr)
    print("Run with --help to see usage.", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
