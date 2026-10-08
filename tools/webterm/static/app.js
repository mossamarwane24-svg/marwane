/* Terminal tablette : client navigateur. Dépend uniquement de xterm.js (vendor/). */
(() => {
  'use strict';

  const KEY_SEQUENCES = {
    esc: '\x1b',
    tab: '\t',
    'ctrl-c': '\x03',
    'ctrl-d': '\x04',
    up: '\x1b[A',
    down: '\x1b[B',
    right: '\x1b[C',
    left: '\x1b[D',
    pipe: '|',
    tilde: '~',
    slash: '/',
    enter: '\r',
  };
  const FONT_KEY = 'webterm.fontSize';

  const $ = (id) => document.getElementById(id);
  const decoder = new TextDecoder('utf-8');

  let term = null;
  let fit = null;
  let since = 0;            // dernier numéro de séquence reçu du serveur
  let polling = false;
  let ctrlArmed = false;    // bouton ctrl « collant » (prochaine touche)
  let pending = '';         // entrée regroupée avant envoi
  let flushTimer = null;
  let chain = Promise.resolve(); // envois dans l'ordre
  let fontSize = Number(localStorage.getItem(FONT_KEY)) || 15;

  function showView(name) {
    $('login').classList.toggle('hidden', name !== 'login');
    $('app').classList.toggle('hidden', name !== 'app');
  }

  function post(path, body) {
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Webterm': '1' },
      body: JSON.stringify(body || {}),
      credentials: 'same-origin',
      cache: 'no-store',
    });
  }

  function initTerminal() {
    if (term) return;
    term = new Terminal({
      cursorBlink: true,
      fontSize,
      scrollback: 5000,
      fontFamily: 'Menlo, Consolas, "DejaVu Sans Mono", monospace',
      theme: { background: '#0b1020', foreground: '#e2e8f0', cursor: '#22d3ee' },
    });
    fit = new FitAddon.FitAddon();
    term.loadAddon(fit);
    term.open($('terminal'));
    term.onData(queueInput);
    term.onResize(({ cols, rows }) => {
      post('/api/resize', { cols, rows }).catch(() => {});
    });
    const refit = () => {
      try { fit.fit(); } catch (_) { /* conteneur pas encore dimensionné */ }
    };
    refit();
    window.addEventListener('resize', refit);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', refit);
  }

  function setCtrl(on) {
    ctrlArmed = on;
    $('ctrl').classList.toggle('armed', on);
  }

  function queueInput(data) {
    if (ctrlArmed && data.length === 1) {
      const code = data.toUpperCase().charCodeAt(0);
      if (code >= 64 && code <= 95) data = String.fromCharCode(code - 64);
      setCtrl(false);
    }
    pending += data;
    if (flushTimer === null) flushTimer = setTimeout(flushInput, 8);
  }

  function flushInput() {
    flushTimer = null;
    const data = pending;
    pending = '';
    if (!data) return;
    chain = chain
      .then(() => post('/api/input', { data }))
      .then((res) => { if (res.status === 401) showView('login'); })
      .catch(() => {});
  }

  function pressKey(name) {
    if (name === 'ctrl') {
      setCtrl(!ctrlArmed);
      return;
    }
    const seq = KEY_SEQUENCES[name];
    if (seq) queueInput(seq);
  }

  async function pollOutput() {
    if (polling) return;
    polling = true;
    let failures = 0;
    while (polling) {
      try {
        const res = await fetch(`/api/output?since=${since}`, {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        if (res.status === 401) {
          polling = false;
          showView('login');
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { chunks } = await res.json();
        for (const chunk of chunks) {
          since = Math.max(since, chunk.seq);
          const bytes = Uint8Array.from(atob(chunk.data), (c) => c.charCodeAt(0));
          term.write(decoder.decode(bytes, { stream: true }));
        }
        failures = 0;
      } catch (_) {
        failures += 1;
        await new Promise((resolve) => setTimeout(resolve, Math.min(10000, 500 * failures)));
      }
    }
  }

  function enterApp() {
    showView('app');
    initTerminal();
    pollOutput();
  }

  $('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const field = $('pw');
    const error = $('login-error');
    error.textContent = '';
    try {
      const res = await post('/api/login', { password: field.value });
      field.value = '';
      if (res.ok) {
        enterApp();
        return;
      }
      error.textContent = res.status === 401 ? 'Mot de passe incorrect.' : `Erreur ${res.status}.`;
    } catch (_) {
      error.textContent = 'Connexion impossible, réessaie.';
    }
  });

  $('tools').addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button || !term) return;
    switch (button.dataset.action) {
      case 'smaller':
      case 'bigger':
        fontSize = Math.min(24, Math.max(10, fontSize + (button.dataset.action === 'bigger' ? 1 : -1)));
        term.options.fontSize = fontSize;
        localStorage.setItem(FONT_KEY, String(fontSize));
        fit.fit();
        break;
      case 'restart': {
        const res = await post('/api/restart').catch(() => null);
        if (res && res.status === 409) {
          term.write('\r\n\x1b[33m[une session est déjà active]\x1b[0m\r\n');
        }
        break;
      }
      case 'logout':
        await post('/api/logout').catch(() => {});
        location.reload();
        return;
      default:
        return;
    }
    term.focus();
  });

  $('keys').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    pressKey(button.dataset.key);
    if (term) term.focus();
  });

  (async () => {
    try {
      const res = await fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' });
      if (res.ok) {
        enterApp();
        return;
      }
    } catch (_) {
      /* hors ligne : on affiche l'écran de connexion */
    }
    showView('login');
  })();
})();
