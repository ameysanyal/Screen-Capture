document.getElementById('overlay').addEventListener('click', createOverlay)


async function createOverlay() {
    console.log('its working now overlay')
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'injectHTML' }, response => {
        console.log(tab.url)
        console.log(response)

        if (response.contentMessage === 'injected') {
            console.log('received injected ack from content.js in extension')

        }

    });
}

