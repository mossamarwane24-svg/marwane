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

g.IS_REACT_ACT_ENVIRONMENT = true;
define('IS_REACT_ACT_ENVIRONMENT', true);

export { dom };
