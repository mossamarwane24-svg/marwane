#!/usr/bin/env python3
"""
Terminal web pour tablette, servi dans l'aperçu Arena (port 8420).

- Un vrai shell bash (pty) ouvert dans le dépôt. La sortie est mise en tampon
  et récupérée par long polling (GET /api/output) ; l'entrée arrive en POST.
  Pas de flux SSE : un proxy de prévisualisation peut mettre un flux en tampon.
- Accès protégé par mot de passe. Il est généré une seule fois dans
  ~/.config/webterm/password (chmod 600), hors du dépôt. Il n'est jamais
  écrit dans les journaux ni dans le chat.
- Session : cookie HttpOnly, Secure, SameSite=Strict, valable 12 h.
- Toute requête POST exige l'en-tête X-Webterm (protection CSRF).

Lancement :  python3 tools/webterm/server.py     (après tools/webterm/setup.sh)
Variables :  WEBTERM_PORT (8420), WEBTERM_WORKDIR (racine du dépôt),
             WEBTERM_PASSWORD_FILE (~/.config/webterm/password)
"""
import base64
import fcntl
import hmac
import http.server
import json
import os
import pathlib
import pty
import secrets
import struct
import sys
import termios
import threading
import time
import urllib.parse
from http import cookies

ROOT = pathlib.Path(__file__).resolve().parent
REPO = ROOT.parent.parent
VENDOR = ROOT / "vendor" / "node_modules"
STATIC = ROOT / "static"

HOST = "0.0.0.0"  # obligatoire pour que l'aperçu Arena atteigne le serveur
PORT = int(os.environ.get("WEBTERM_PORT", "8420"))
WORKDIR = os.environ.get("WEBTERM_WORKDIR", str(REPO))
PASSWORD_FILE = pathlib.Path(
    os.environ.get(
        "WEBTERM_PASSWORD_FILE",
        str(pathlib.Path.home() / ".config" / "webterm" / "password"),
    )
)
SESSION_TTL = 12 * 3600
BUFFER_MAX = 512 * 1024  # octets de sortie gardés pour recharger la page
MAX_BODY = 64 * 1024
POLL_WAIT = 10  # secondes de long polling

ASSETS = {
    "/": (STATIC / "index.html", "text/html; charset=utf-8"),
    "/app.js": (STATIC / "app.js", "text/javascript; charset=utf-8"),
    "/style.css": (STATIC / "style.css", "text/css; charset=utf-8"),
    "/vendor/xterm.js": (VENDOR / "@xterm" / "xterm" / "lib" / "xterm.js", "text/javascript; charset=utf-8"),
    "/vendor/xterm.css": (VENDOR / "@xterm" / "xterm" / "css" / "xterm.css", "text/css; charset=utf-8"),
    "/vendor/addon-fit.js": (
        VENDOR / "@xterm" / "addon-fit" / "lib" / "addon-fit.js",
        "text/javascript; charset=utf-8",
    ),
}

PASSWORD = ""
TERM = None


class Terminal:
    """Un shell bash dans un pty. Sa sortie est mise en tampon avec un numéro de séquence."""

    def __init__(self):
        self.cond = threading.Condition()
        self.start_lock = threading.Lock()
        self.chunks = []  # liste de (seq, octets)
        self.size = 0
        self.seq = 0
        self.alive = False
        self.pid = None
        self.fd = None

    def _push(self, data):
        with self.cond:
            self.seq += 1
            self.chunks.append((self.seq, data))
            self.size += len(data)
            while self.size > BUFFER_MAX and len(self.chunks) > 1:
                self.size -= len(self.chunks.pop(0)[1])
            self.cond.notify_all()

    def start(self):
        """Démarre un bash si aucun n'est actif. Renvoie False si une session tourne déjà."""
        with self.start_lock:
            if self.alive:
                return False
            if self.fd is not None:
                try:
                    os.close(self.fd)
                except OSError:
                    pass
            pid, fd = pty.fork()
            if pid == 0:  # processus enfant : on le remplace par bash
                try:
                    os.chdir(WORKDIR)
                except OSError:
                    pass
                env = dict(os.environ)
                env["TERM"] = "xterm-256color"
                env.setdefault("LANG", "C.UTF-8")
                try:
                    os.execvpe("bash", ["bash", "-l"], env)
                finally:
                    os._exit(127)
            with self.cond:
                self.pid, self.fd, self.alive = pid, fd, True
            threading.Thread(target=self._reader, args=(pid, fd), daemon=True).start()
            return True

    def _reader(self, pid, fd):
        while True:
            try:
                data = os.read(fd, 65536)
            except OSError:
                data = b""
            if not data:
                break
            self._push(data)
        with self.cond:
            self.alive = False
        try:
            os.waitpid(pid, 0)
        except ChildProcessError:
            pass
        self._push("\r\n\x1b[33m[session terminée : ↻ pour en démarrer une nouvelle]\x1b[0m\r\n".encode("utf-8"))

    def write(self, data: bytes) -> bool:
        with self.cond:
            if not self.alive:
                return False
            fd = self.fd
        try:
            view = memoryview(data)
            while view:
                written = os.write(fd, view)
                view = view[written:]
        except OSError:
            return False
        return True

    def resize(self, cols, rows):
        with self.cond:
            if not self.alive:
                return
            fd = self.fd
        try:
            fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack("HHHH", rows, cols, 0, 0))
        except OSError:
            pass

    def read_since(self, last, timeout):
        """Renvoie les morceaux de sortie après `last`. Attend jusqu'à `timeout` s si rien n'est prêt."""
        with self.cond:
            if self.seq <= last:
                self.cond.wait(timeout)
            return [(seq, data) for seq, data in self.chunks if seq > last]


SESSIONS = {}  # jeton -> date d'expiration (époque)
SESSIONS_LOCK = threading.Lock()


def new_session():
    token = secrets.token_urlsafe(32)
    now = time.time()
    with SESSIONS_LOCK:
        for old in [t for t, exp in SESSIONS.items() if exp < now]:
            del SESSIONS[old]
        SESSIONS[token] = now + SESSION_TTL
    return token


def is_valid(token):
    if not token:
        return False
    with SESSIONS_LOCK:
        expires = SESSIONS.get(token)
        if expires is None:
            return False
        if expires < time.time():
            del SESSIONS[token]
            return False
        return True


def end_session(token):
    if token:
        with SESSIONS_LOCK:
            SESSIONS.pop(token, None)


def load_password():
    try:
        existing = PASSWORD_FILE.read_text(encoding="utf-8").strip()
        if existing:
            return existing
    except FileNotFoundError:
        pass
    PASSWORD_FILE.parent.mkdir(parents=True, exist_ok=True)
    password = secrets.token_urlsafe(18)
    fd = os.open(PASSWORD_FILE, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as fh:
        fh.write(password + "\n")
    os.chmod(PASSWORD_FILE, 0o600)
    return password


class Handler(http.server.BaseHTTPRequestHandler):
    server_version = "webterm"
    sys_version = ""

    def log_message(self, fmt, *args):  # journal minimal : ni chemins de requête ni corps
        return

    def _token(self):
        raw = self.headers.get("Cookie")
        if not raw:
            return None
        jar = cookies.SimpleCookie()
        try:
            jar.load(raw)
        except cookies.CookieError:
            return None
        morsel = jar.get("wt_session")
        return morsel.value if morsel else None

    def _send(self, code, body, ctype, extra_headers=()):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        for name, value in extra_headers:
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def _json(self, code, obj, extra_headers=()):
        self._send(code, json.dumps(obj).encode("utf-8"), "application/json; charset=utf-8", extra_headers)

    def _body(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return None
        if length < 0 or length > MAX_BODY:
            return None
        raw = self.rfile.read(length) if length else b""
        try:
            data = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            return None
        return data if isinstance(data, dict) else None

    def do_GET(self):
        url = urllib.parse.urlsplit(self.path)
        path = url.path
        if path in ASSETS:
            file_path, ctype = ASSETS[path]
            try:
                body = file_path.read_bytes()
            except FileNotFoundError:
                return self._json(503, {"error": "fichiers manquants : lancer tools/webterm/setup.sh"})
            return self._send(200, body, ctype)
        if path == "/api/me":
            ok = is_valid(self._token())
            return self._json(200 if ok else 401, {"ok": ok})
        if path == "/api/output":
            if not is_valid(self._token()):
                return self._json(401, {"error": "auth"})
            query = urllib.parse.parse_qs(url.query)
            try:
                since = int(query.get("since", ["0"])[0])
            except ValueError:
                since = 0
            items = TERM.read_since(since, POLL_WAIT)
            chunks = [{"seq": seq, "data": base64.b64encode(data).decode("ascii")} for seq, data in items]
            return self._json(200, {"chunks": chunks, "alive": TERM.alive})
        return self._json(404, {"error": "introuvable"})

    def do_POST(self):
        path = urllib.parse.urlsplit(self.path).path
        if self.headers.get("X-Webterm") != "1":
            return self._json(403, {"error": "en-tête X-Webterm manquant"})

        if path == "/api/login":
            body = self._body()
            if body is None:
                return self._json(400, {"error": "requête invalide"})
            given = str(body.get("password", "")).encode("utf-8")
            if hmac.compare_digest(given, PASSWORD.encode("utf-8")):
                cookie = (
                    f"wt_session={new_session()}; Path=/; Max-Age={SESSION_TTL}; "
                    "HttpOnly; Secure; SameSite=Strict"
                )
                return self._json(200, {"ok": True}, [("Set-Cookie", cookie)])
            time.sleep(1.5)  # freine les essais répétés
            return self._json(401, {"error": "mot de passe incorrect"})

        if path == "/api/logout":
            end_session(self._token())
            expired = "wt_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"
            return self._json(200, {"ok": True}, [("Set-Cookie", expired)])

        if not is_valid(self._token()):
            return self._json(401, {"error": "auth"})

        if path == "/api/input":
            body = self._body()
            if body is None or not isinstance(body.get("data"), str):
                return self._json(400, {"error": "data requis"})
            ok = TERM.write(body["data"].encode("utf-8"))
            return self._json(200 if ok else 409, {"ok": ok})

        if path == "/api/resize":
            body = self._body() or {}
            try:
                cols = max(2, min(500, int(body.get("cols", 80))))
                rows = max(2, min(200, int(body.get("rows", 24))))
            except (TypeError, ValueError):
                return self._json(400, {"error": "cols/rows invalides"})
            TERM.resize(cols, rows)
            return self._json(200, {"ok": True})

        if path == "/api/restart":
            started = TERM.start()
            return self._json(200 if started else 409, {"ok": started})

        return self._json(404, {"error": "introuvable"})


def main():
    global PASSWORD, TERM
    missing = [str(path) for path, _ in ASSETS.values() if not path.exists()]
    if missing:
        print("Fichiers manquants (lancer tools/webterm/setup.sh) :", *missing, file=sys.stderr, flush=True)
    PASSWORD = load_password()
    TERM = Terminal()
    TERM.start()
    httpd = http.server.ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"webterm prêt sur {HOST}:{PORT}, dépôt : {WORKDIR}", flush=True)
    print(f"mot de passe : {PASSWORD_FILE} (non affiché)", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
