// dataChannel.js

let dataChannel;

const createDataChannel = (peerConnection, label = "default") => {
    dataChannel = peerConnection.createDataChannel(label);
    setupDataChannelHandlers(dataChannel);
    return dataChannel;
};
const chat = document.getElementById("chat");
const setupDataChannelHandlers = (dataChannel_) => {
    dataChannel =  dataChannel_;
    dataChannel.onopen = () => {
            console.log("Data channel opened");
            document.getElementById("message-input").disabled = false;
            chat.innerHTML ="<b>You are connected</b>";
    };

    dataChannel.onclose = () => {
        console.log("Data channel closed");
    };

    dataChannel.onmessage = (event) => {
        chat.innerHTML +=`<div class="message received">
                <div class="avatar">S</div>
                <div class="message-text">${event.data}</div>
        </div>`;
        console.log("Received message:",event.data );
    };

    dataChannel.onerror = (error) => {
        console.error("Data channel error:", error)
    };
};

const sendMessage = (message) => {
    // dataChannel =  window.dataChannel;
    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(message);
        console.log("Message sent:", message);
    } else {
        console.error("Data channel is not open");
    }
};

const closeDataChannel = () => {
    if (dataChannel) {
        dataChannel.close();
        console.log("Data channel closed");
    }
};





export {createDataChannel,setupDataChannelHandlers,sendMessage,closeDataChannel}
