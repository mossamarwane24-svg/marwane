/**
 * Environnement DOM minimal (jsdom) pour rendre l'application hors navigateur.
 * Doit etre importe AVANT tout module React.
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true
});

const g = globalThis as unknown as Record<string, unknown>;

/** Definit une globale sans jamais planter (certaines sont en lecture seule). */
const define = (key: string, value: unknown) => {
  try {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  } catch {
    /* ignore : la globale existe deja en lecture seule */
  }
};

define('window', dom.window);
define('document', dom.window.document);
define('location', dom.window.location);
define('history', dom.window.history);
define('localStorage', dom.window.localStorage);
define('sessionStorage', dom.window.sessionStorage);
define('getComputedStyle', dom.window.getComputedStyle.bind(dom.window));
define('requestAnimationFrame', dom.window.requestAnimationFrame.bind(dom.window));
define('cancelAnimationFrame', dom.window.cancelAnimationFrame.bind(dom.window));
define('navigator', dom.window.navigator);

// Classes et APIs utilisees par React ou l'application.
['HTMLElement', 'Element', 'Node', 'Event', 'CustomEvent', 'MouseEvent', 'KeyboardEvent', 'DOMParser', 'XMLHttpRequest', 'WebSocket'].forEach(
  (key) => define(key, (dom.window as unknown as Record<string, unknown>)[key])
);

// APIs non fournies par jsdom : on les remplace par des versions muettes.
class FakeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
define('IntersectionObserver', FakeObserver);
define('ResizeObserver', FakeObserver);

const fakeAudioContext = class {
  state = 'running';
  destination = {};
  currentTime = 0;
  createOscillator() {
    return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 }, type: 'sine' };
  }
  createGain() {
    return { connect: () => {}, gain: { value: 0, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} } };
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
};
define('AudioContext', fakeAudioContext);
define('webkitAudioContext', fakeAudioContext);

if (!dom.window.matchMedia) {
  define('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false
  }));
} else {
  define('matchMedia', dom.window.matchMedia.bind(dom.window));
}
if (!dom.window.print) {
  (dom.window as unknown as Record<string, unknown>).print = () => {};
}
define('print', (dom.window as unknown as Record<string, unknown>).print);
define('scrollTo', () => {});

/**
 * Les tests ne doivent RIEN ecrire sur le serveur : on neutralise fetch et les
 * websockets. L'application bascule donc sur ses donnees hors ligne (ce qui
 * permet justement de verifier qu'elle fonctionne sans serveur).
 */
define('fetch', async (url: unknown, init: unknown) => {
  if (process.env.DEBUG_NET) console.error('[NET]', (init as { method?: string })?.method ?? 'GET', url);
  return {
    ok: false,
    status: 503,
    json: async () => ({}),
    text: async () => ''
  };
});
/** XHR muet : sans cela, socket.io-client interrogerait le vrai serveur. */
class FakeXMLHttpRequest {
  static UNSENT = 0;
  static OPENED = 1;
  static HEADERS_RECEIVED = 2;
  static LOADING = 3;
  static DONE = 4;
  readyState = 0;
  status = 0;
  responseText = '';
  response = '';
  onreadystatechange: unknown = null;
  onload: unknown = null;
  onerror: unknown = null;
  addEventListener() {}
  removeEventListener() {}
  open() {
    this.readyState = 1;
  }
  setRequestHeader() {}
  getAllResponseHeaders() {
    return '';
  }
  getResponseHeader() {
    return null;
  }
  abort() {}
  /** Ne declenche jamais de callback : la connexion reste "en attente". */
  send() {}
}
define('XMLHttpRequest', FakeXMLHttpRequest);
(dom.window as unknown as Record<string, unknown>).XMLHttpRequest = FakeXMLHttpRequest;

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = 0;
  addEventListener() {}
  removeEventListener() {}
  send() {}
  close() {}
}
define('WebSocket', FakeWebSocket);
(dom.window as unknown as Record<string, unknown>).WebSocket = FakeWebSocket;

g.IS_REACT_ACT_ENVIRONMENT = true;
define('IS_REACT_ACT_ENVIRONMENT', true);

export { dom };
