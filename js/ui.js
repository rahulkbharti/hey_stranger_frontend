import {
    sendAnswer,
    getMatch,
    onMatch,
    onNoMatch,
    onError,
    sendOffer,
    onOffer,
    onIceCandidate,
    onAnswer,
    hangUp,
    onHangup,
} from "./socket.js";
import {
    createPeerConnection,
    getPeerConnection,
    closePeerConnection,
} from "./webrtc.js";
import {
    createDataChannel,
    setupDataChannelHandlers,
    sendMessage,
    closeDataChannel
} from "./dataChannel.js";
// GLOBAL VARIABLE DECLARATIONS
let otherSide = null;
let localStream = null;
let candidateQueue = [];
// Initialize media stream
async function init() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        });
        const localVideo = document.getElementById("local-video");
        if(localVideo){
            localVideo.srcObject = localStream;
            localVideo.autoplay = true;
            localVideo.muted = true;
        }
        else{
            console.error("check the local-video element id...");
        }
    } catch (error) {
        console.error("Error accessing media devices.", error);
    }
}

// Connection establishment
onMatch(async ({ roomId, user, type }) => {
    console.log({ roomId, user, type });
    otherSide = user.id;
    if (type === "createAnOffer") {
        await startCall({ roomId, user, type });
    } else {
        // Handle receiving an offer
    }
});
onNoMatch((message) => console.log(message));
onError((error) => console.log(error));
onOffer(async (offer) => {
    console.log("An Offer is Received:", offer);
    await handleOffer(offer);
});
onAnswer(async (answer) => {
    console.log("An Answer is received:");
    const peerConnection = getPeerConnection(otherSide);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    // Add queued ICE candidates
    while (candidateQueue.length) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidateQueue.shift()));
    }
    console.log(peerConnection);
});
onIceCandidate(async (candidate) => {
    const peerConnection = getPeerConnection(otherSide);
    if (peerConnection.remoteDescription == null) {
        console.log("Queuing ICE candidate because remote description is not set yet.");
        candidateQueue.push(candidate);
    } else {
        console.log("A candidate is received:");
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
});
onHangup(() => {
    if (otherSide !== null) {
        closePeerConnection(otherSide);
        console.log("Connection Closed");
        otherSide = null;
        closeDataChannel();
    } else {
        console.log("Connect It First");
    }
});
// Connection Listener End

const chat = document.getElementById("chat");
const DataChannelOperations = {
    onOpen: () => {
        console.log("Data channel opened");
        document.getElementById("message-input").disabled = false;
        chat.innerHTML ="<b>You are connected</b>";
    },
    onClose: () => console.log("Data channel closed"),
    onMessage: (message) => {
        chat.innerHTML +=`<div class="message received">
                <div class="avatar">S</div>
                <div class="message-text">${message}</div>
        </div>`;
        console.log("Received message:", message);
    },
    onError: (error) => console.error("Data channel error:", error),
}
const startCall = async ({ roomId, user, type }) => {
    try {
        const peerConnection = await createPeerConnection(otherSide, localStream);
        createDataChannel(peerConnection, "default");
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        sendOffer(offer, otherSide);
    } catch (error) {
        console.error("Error starting call:", error);
    }
};
// Handel the offer or create the Answer Based on the offer Received.
const handleOffer = async (offer) => {
    try {
        const peerConnection = await createPeerConnection(otherSide, localStream);
        // handling datachannel Event
        peerConnection.ondatachannel = (event) => {
            const receivedChannel = event.channel;
            setupDataChannelHandlers(receivedChannel);
        };
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        sendAnswer(answer, otherSide);
        // Add queued ICE candidates
        while (candidateQueue.length) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidateQueue.shift()));
        }
        console.log(peerConnection);
    } catch (error) {
        console.error("Error handling offer:", error);
    }
};

window.onload = ()=>{
    if(localStorage.getItem("type") === "video"){
        init().then(() => {

        })
    }
};

document.getElementById("esc-btn").onclick = () => {
    // const usernameInput = document.getElementById("username");
    // const interestsInput = document.getElementById("interests");
    const chatType = localStorage.getItem("type");
    // const username = usernameInput.value.trim();
    // const interests = interestsInput.value.trim().split(",").map((i) => i.trim());
    const username = localStorage.getItem("username");
    const interests = localStorage.getItem('interests');
    if (username) {
        getMatch({username, interests,chatType});
    }
};

document.getElementById("end_button").onclick = () => {
    if (otherSide !== null) {
        hangUp(otherSide);
        closePeerConnection(otherSide);
        console.log("Connection Closed");
        otherSide = null;
        closeDataChannel();
    } else {
        console.log("Connect it first...");
    }
};

let message = document.getElementById("message-input");
document.getElementById("send-btn").onclick =()=>{
    const chat = document.getElementById("chat");
        chat.innerHTML+=`<div class="message sent">
                <div class="message-text">${message.value}</div>
              </div>`;
        sendMessage(message.value);
        message.value ="";
}

export {getMatch};