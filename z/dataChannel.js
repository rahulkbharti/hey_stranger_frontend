// dataChannel.js

export let dataChannel;

export const createDataChannel = (peerConnection, label = "default", callbacks = {}) => {
    dataChannel = peerConnection.createDataChannel(label);
    setupDataChannelHandlers(dataChannel, callbacks);
    return dataChannel;
};

export const setupDataChannelHandlers = (dataChannel, { onOpen, onClose, onMessage, onError } = {}) => {
    window.dataChannel =  dataChannel;
    dataChannel.onopen = () => {
        if (onOpen) onOpen();
    };

    dataChannel.onclose = () => {
        if (onClose) onClose();
    };

    dataChannel.onmessage = (event) => {
        if (onMessage) onMessage(event.data);
    };

    dataChannel.onerror = (error) => {
        if (onError) onError(error);
    };
};

export const sendMessage = (message) => {
    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(message);
        console.log("Message sent:", message);
    } else {
        console.error("Data channel is not open");
        dataChannel.send(message);
    }
};

export const closeDataChannel = () => {
    if (dataChannel) {
        dataChannel.close();
        console.log("Data channel closed");
    }
};

