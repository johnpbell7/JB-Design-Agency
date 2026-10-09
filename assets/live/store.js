/* Storage isolation for live copies (see assets/live/README.md, "Parade").
   Several live frames of one site share the portfolio's localStorage, so a basket filled
   in one phone would show up in the others and in the desktop film. When the frame that
   holds this page has data-live-store="<key>", localStorage is swapped for an in-memory
   store kept on the parent under window.__liveStores[<key>]: it survives page changes
   inside that frame and is private to it. The parent deletes the key to start afresh.
   Without the attribute (or opened directly) it does nothing.
   Load it first in <head>, before any script that touches storage:
     <script src="../store.js"></script> */
(() => {
  let key = null, bags = null;
  try { key = window.frameElement && frameElement.dataset.liveStore; bags = key && (parent.__liveStores = parent.__liveStores || {}); } catch (e) { return; }
  if (!key) return;
  const bag = () => (bags[key] = bags[key] || {});
  const store = {
    getItem: k => (Object.prototype.hasOwnProperty.call(bag(), k) ? bag()[k] : null),
    setItem: (k, v) => { bag()[k] = String(v); },
    removeItem: k => { delete bag()[k]; },
    clear: () => { bags[key] = {}; },
    key: i => Object.keys(bag())[i] ?? null,
    get length() { return Object.keys(bag()).length; },
  };
  try { Object.defineProperty(window, 'localStorage', { value: store, configurable: true }); } catch (e) { /* keep the real one */ }
})();
