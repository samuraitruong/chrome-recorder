/* global chrome, MediaRecorder, FileReader */
let handle;
let recorder = null;
let port = {};

function onRemoveDesktopMedia(d) {
  console.log('onRemoveDesktopMedia', d);
}
function onRecordStopRequest() {
  window.RECORDING = false;
  console.log('Stopping recording', port, recorder, handle);
  if (recorder) {
    recorder.stop();
    recorder = null;
  }
  port.recorderPlaying = false;
  if (handle) {
  }
  handle = null;
}
function onRecordRequest(sender) {
  window.RECORDING = true;
  console.log('port', port);
  if (port.recorderPlaying) {
    console.log('Ignoring second play, already playing');
    return;
  }
  // const tab = port.sender.tab;
  // tab.url = msg.data.url;
  handle = chrome.desktopCapture.chooseDesktopMedia(
    ['tab', 'audio'],
    sender.tab,
    // 'window', 'screen',
    (streamId) => {
      if (!streamId) {
        return;
      }

      console.log('streamID', streamId);
      // Get the stream
      navigator.webkitGetUserMedia(
        {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: streamId,
              minWidth: 1280,
              maxWidth: 1280,
              minHeight: 720,
              maxHeight: 720,
              minFrameRate: 60,
            },
          },
        },
        (stream) => {
          console.log('set tatus');
          port.recorderPlaying = true;
          window.RECORDING = true;
          var chunks = [];
          recorder = new MediaRecorder(stream, {
            videoBitsPerSecond: 2500000,
            ignoreMutedMedia: true,
            mimeType: 'video/webm',
          });
          recorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };

          recorder.onstop = function () {
            var superBuffer = new Blob(chunks, {
              type: 'video/webm',
            });

            var url = URL.createObjectURL(superBuffer);

            chrome.downloads.download({
              url: url,
              // filename: "record", // Optional
            });
            console.log('close stream');
            window.RECORDING = false;
            stream.getVideoTracks()[0].stop();
          };

          recorder.start();
        },
        (error) => console.log('Unable to get user media', error)
      );
    }
  );
}
function onMessageEvent(msg, sender) {
  switch (msg.type) {
    case 'REC_STOP':
      onRecordStopRequest(sender);
      break;
    case 'REC_CLIENT_PLAY':
      onRecordRequest(sender);
      break;
    default:
      console.log('Unrecognized message', msg);
  }
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('got message', request, sender);
  onMessageEvent(request, sender);
  sendResponse({ result: 'Gotcha' });

  // Note: Returning true is required here!
  //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
  return true;
});

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    onMessageEvent(msg);
  });
});
