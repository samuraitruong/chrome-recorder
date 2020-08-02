// Act as proxy to forward message to background service
// this script will be injected on every page

window.onload = () => {
  if (window.recorderInjected) return;
  Object.defineProperty(window, 'recorderInjected', {
    value: true,
    writable: false,
  });

  // Setup message passing
  const port = chrome.runtime.connect(chrome.runtime.id);
  window.chrome = port;
  port.onMessage.addListener((msg) => window.postMessage(msg, '*'));
  window.addEventListener('message', (event) => {
    if (
      event.source === window &&
      event.data.type &&
      event.data.type.startsWith('REC_')
    ) {
      console.log('relay message', event.data);
      port.postMessage(event.data);
    }
  });
};
