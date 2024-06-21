chrome.runtime.onInstalled.addListener(() => {
    console.log("Screen Capture Extension installed.");
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'overlayInjected') {
        console.log('received injected ack from content.js in background')
        chrome.desktopCapture.chooseDesktopMedia(["screen", "window", "tab"], sender.tab, (streamId) => {
            sendResponse({ messageToContent: 'selectOverlay', streamId })


        });

        return true;
    }

})

