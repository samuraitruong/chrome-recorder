let start;
let stop;

function logMessage(message) {
  console.log(message);
}
function startRecoding() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;
    chrome.runtime.sendMessage(
      {
        type: 'REC_CLIENT_PLAY',
        data: { url },
      },
      logMessage
    );
    start.setAttribute('class', 'hidden');
    stop.setAttribute('class', '');
  });
}
function stopRecoding() {
  chrome.runtime.sendMessage({
    type: 'REC_STOP',
  });

  start.setAttribute('class', '');
  stop.setAttribute('class', 'hidden');
}
function onBackgrounPage(bakground) {
  console.log('bakground', bakground.RECORDING);
  if (bakground.RECORDING) {
    start.setAttribute('class', 'hidden');
    stop.setAttribute('class', '');
  } else {
    stop.setAttribute('class', 'hidden');
  }
}
window.onload = () => {
  stop = document.querySelector('#stop');
  start = document.querySelector('#start');

  start.addEventListener('click', startRecoding);
  stop.addEventListener('click', stopRecoding);

  chrome.runtime.getBackgroundPage(onBackgrounPage);
};
