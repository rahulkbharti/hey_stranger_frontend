
// Modules Imports
import {
    getMatch,
    onMatch,
    onNoMatch,
    onError,
    sendOffer,
    onOffer,
    sendAnswer,
    onAnswer,
    onIceCandidate,
    hangUp,
    onHangup
} from "./socket.js";
import {
    createPeerConnection,
    getPeerConnection,
    closePeerConnection,
} from "./webrtc.js";
import {
    createDataChannel,
    setupDataChannelHandlers,
    closeDataChannel
} from "./dataChannel.js";
// DOM access
import { connectDisconnectButton, typingIndicator } from "./doms.js";

// GLOBAL VARIABLE DECLARATIONS
let otherSide = null;
let localStream = null;
let candidateQueue = [];
let isConnected = false;
let partnerInfo = null;
const setIsConnected = (value) => {
    isConnected = value;
}
// Initialize media stream
async function init() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        });
        const localVideo = document.getElementById("local-video");
        if (localVideo) {
            localVideo.srcObject = localStream;
            localVideo.autoplay = true;
            localVideo.muted = true;
        }
        else {
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
    partnerInfo = user;
    if (type === "createAnOffer") {
        await startCall({ roomId, user, type });
    } else {
        // Handle receiving an offer
    }
    // console.log("Matched with:", user);
});
onNoMatch((status) => {
    console.log(status);
    if (status.code === 601) {
        const promt = window.confirm(status.message + " Want to connect Anonymously?");
        if (promt) {
            const chatType = localStorage.getItem("type");
            const username = localStorage.getItem("username");
            const interests = "";
            if (getMatch) {
                getMatch({ username, interests, chatType });
                typingIndicator.innerHTML = "Connecting Anynomously...";
            }
        }
    }
    else {
        const promt = window.confirm(status.message + " Want to Retry?");
        if (promt) {
            const chatType = localStorage.getItem("type");
            const username = localStorage.getItem("username");
            const interests = localStorage.getItem('interests');
            if (getMatch) {
                getMatch({ username, interests, chatType });
                typingIndicator.innerHTML = "Retrying...";
            }
        }
    }
});
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

const chat = document.getElementById("chat");
const DataChannelOperations = {
    onOpen: () => {
        console.log("Data channel opened");
        document.getElementById("message-input").disabled = false;
        chat.innerHTML = "<b>You are connected</b>";
    },
    onClose: () => console.log("Data channel closed"),
    onMessage: (message) => {
        chat.innerHTML += `<div class="message received">
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

// window.onload = ()=>{
//     if(localStorage.getItem("type") === "video"){
//         init().then(() => {
//
//         })
//     }
// };

// Connection : Connect/Disconnect button
if (connectDisconnectButton) {
    connectDisconnectButton.onclick = () => {
        // if(!getMatch()) console.error({message:"There is problem in getMatch import.",module:"dataChannel"});
        if (!isConnected) {
            const chatType = localStorage.getItem("type");
            const username = localStorage.getItem("username");
            const interests = localStorage.getItem('interests');
            if (getMatch) {
                getMatch({ username, interests, chatType });
                typingIndicator.innerHTML = "Connecting...";
            }
        }
        else {

            let x = window.confirm("Want to really Disconnect.");
            if (!x) {
                return;
            }

            if (otherSide !== null) {
                hangUp(otherSide);
                closePeerConnection(otherSide);
                console.log("Connection Closed");
                otherSide = null;
                closeDataChannel();
            } else {
                console.log("Connect it first...");
            }
        }
    }
}
else {
    console.error({
        message: "The connection button id is not matched/Found.",
        module: "dataChannel"
    })
}

export { setIsConnected, partnerInfo };