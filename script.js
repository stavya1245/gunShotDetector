// script.js

const socket = new WebSocket('ws://localhost:8765');

socket.onopen = function() {
    console.log("WebSocket connection established.");
    const deviceName = prompt("Enter device name (north, south, left, right):");
    startListening(deviceName);
};

socket.onerror = function(error) {
    console.error("WebSocket Error: ", error);
};

socket.onmessage = function(event) {
    console.log("Message from server: ", event.data);
};


function startListening(deviceName) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        scriptProcessor.onaudioprocess = function() {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            const maxVolume = Math.max(...array);

            if (maxVolume > 100) {  // Sound detection threshold
                const timestamp = Date.now();
                socket.send(JSON.stringify({ device: deviceName, timestamp: timestamp }));
            }
        };
    }).catch(function(err) {
        console.error('Error accessing microphone: ', err);
    });
}

socket.onmessage = function(event) {
    const direction = event.data;

    document.querySelectorAll('.direction').forEach((div) => {
        div.classList.remove('active');
    });

    document.getElementById(direction).classList.add('active');
};
