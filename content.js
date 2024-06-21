console.log('its content file hello');
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'injectHTML') {
        console.log('hello from inside of content file');

        let overlay = document.createElement('div');

        overlay.style.cssText = `
            z-index: 1000;
            position: fixed;
            top: 50%;
            left: 50%;
            width: 50%;
            height: 50%;
            background-color: orange;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
        `;


        overlay.innerHTML = `
            <div style="width: 75%; height: 75%; padding: 20px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <video id="videoElement" controls style="width: 100%; height: auto;"></video>
                <button id="startStopButton" style="padding: 10px; margin-bottom: 10px; margin: auto; background-color: blue; font-weight: bold;">Start</button>
            </div>
        `;


        console.log(overlay)

        document.body.appendChild(overlay);

        sendResponse({ contentMessage: 'injected' });

        let isCapturing = false;
        let videoElement = document.getElementById('videoElement');
        let recorder;
        let recordedChunks = [];

        document.getElementById('startStopButton').addEventListener('click', () => {
            if (isCapturing) {
                stopCapturing();
            } else {
                startCapturing();
            }
        });

        function startCapturing() {
            chrome.runtime.sendMessage({ action: "overlayInjected" }, (response) => {
                console.log('Response from background script:', response.messageToContent, response.streamId);
                if (response.messageToContent === 'selectOverlay') {
                    if (!response.streamId) {
                        console.error('Failed to get stream ID');
                        return;
                    }

                    navigator.mediaDevices.getUserMedia({
                        audio: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: response.streamId
                            }
                        },
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: response.streamId
                            }
                        }
                    }).then(stream => {
                        // console.log(`this is stream ${stream}`)
                        // console.log('Audio Tracks:', stream.getAudioTracks());
                        // console.log('Video Tracks:', stream.getVideoTracks());
                        videoElement.srcObject = stream;
                        videoElement.play();
                        document.getElementById('startStopButton').textContent = 'Stop';
                        isCapturing = true;

                        recorder = new MediaRecorder(stream);
                        recordedChunks = [];
                        recorder.ondataavailable = handleDataAvailable;
                        recorder.onstop = handleStop;
                        recorder.start();
                    }).catch(err => {
                        console.error('Failed to get media stream', err);
                    });
                }
            });
        }

        function handleDataAvailable(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        }

        function handleStop() {
            let recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
            videoElement.srcObject = null;
            videoElement.src = URL.createObjectURL(recordedBlob);
            videoElement.play();
        }

        function stopCapturing() {
            if (recorder) {
                recorder.stop();
                let tracks = videoElement.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                document.getElementById('startStopButton').textContent = 'Start';
                isCapturing = false;
            }
        }
    }
});

















// Explanation
// Overlay Creation: An overlay div is created with a fixed position and centered on the screen. It contains a video element and a button.
// Event Listener for Button: The button toggles between starting and stopping the capture.
// Start Capturing:
// Sends a message to the background script to request a screen capture stream.
// If the streamId is valid, it uses navigator.mediaDevices.getUserMedia to get the desktop stream.
// The video element plays the live stream.
// A MediaRecorder is initialized to record the stream.
// Stop Capturing:
// Stops the MediaRecorder and the media tracks.
// The recorded video is played by creating a Blob URL from the recorded chunks.
// Handling Recorded Data:
// The handleDataAvailable function collects the recorded data chunks.
// The handleStop function creates a Blob from the collected chunks and sets the Blob URL as the source of the videoElement.
// This code should now correctly handle recording and playback of the video stream. Ensure that the background script correctly sends the streamId and other necessary responses.