/*************************************************
 * Refactered
 *  There is no commonets 
 **************************************************/

import { socket as Socket, getPartner, SendOffer, SendAnswer, SendCandidate, SendHangUP } from "./socket.js"
import { handelDataChannel } from "./chat.js"
import { updateWaitForPartner } from "./ui.js"
import { getStream, HandleRemoteStream } from "./stream.js";
import handelLikes from "./likes.js";
import { connectDisconnectButton as EscBtn, } from "./elements.js";

let partnerID;
let pc;
let dataChannel;
let localStream;
let socket;
let likes = [];
let partnerIntrests;
const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
}
//
var urlParams = new URLSearchParams(window.location.search);
var mode = urlParams.get('mode');
var arrayParam = urlParams.get('tags');
likes = JSON.parse(decodeURIComponent(arrayParam));

// WebRTC Functions
const StartCall = async (intrests) => {
    socket = Socket;
    socket.removeAllListeners();
    // Get the local stream
    // try {
    //     localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // } catch (e) {
    //     console.error("Error Getting User Media", e);
    //     alert("Please allow the camera and microphone access for video call access");
    //     let check = confirm("If you continue with chat only mode, you will not be able to make video calls. Do you want to continue?");
    //     if (!check) {
    //         return;
    //     }
    // }
    if (mode === "video") {
        localStream = await getStream();
        if (!localStream) {
            let check = confirm("If you continue with chat only mode, you will not be able to make video calls. Do you want to continue?");
            if (!check) {
                return;
            }
        }
    }


    // let responce = await getPartner(intrests);

    // if(!responce){
    //     console.log("No Partner Found, Please Try Again Later",responce);
    //     return;
    // }else{
    //     console.log("Partner Found",responce);
    // }
    getPartner(intrests).then((responce) => {
        if (!responce) {
            console.log("No Partner Found, Please Try Again Later", responce);
            // EscBtn.disabled = false;
            return;
        }
        else {
            const WaitingPartner = (message, id) => {
                if (!id) {
                    console.error("No Partner ID Found");
                    return;
                }
                partnerIntrests = message?.intrests;
                partnerID = id;
                window.partnerID = id;
                EscBtn.disabled = false;
                InitaliseAnswerer();
            }
            console.log("Partner Status:", responce);
            let waitTimeout ;
            if (responce.action === "intiate") {
                partnerIntrests = responce.intrests;
                partnerID = responce.partner_id;
                window.partnerID = responce.partner_id;
                EscBtn.disabled = false;
                InitaliseOffer();
            } else {
                const escMainText = document.getElementById("esc-main-text");
                escMainText.innerHTML = "Waiting...";
                EscBtn.disabled = true;
                socket.on("handshake", WaitingPartner);
                waitTimeout = setTimeout(() => {
                    socket.removeListener('handshake', WaitingPartner);
                    const escMainText = document.getElementById("esc-main-text");
                    escMainText.innerHTML = "Matching not found, Click to retry...";
                    EscBtn.disabled = false;
                }, responce.time);
            }
            socket.onAny(()=>{
                if(waitTimeout){
                    clearTimeout(waitTimeout);
                }
            });
        }
    });
    // Update the UI
    updateWaitForPartner("Waiting for partner");
    // Start Listening on handshake
    // socket.on("handshake", (message, id) => {
    //     if (!id) {
    //         console.error("No Partner ID Found");
    //         return;
    //     }
    //     console.log("Your Intrests", message?.intrests);
    //     partnerIntrests =  message?.intrests;
    //     partnerID = id;
    //     window.partnerID = id;

    //     EscBtn.disabled = false;
    //     // if the message is offer then start the call
    //     if (message.type == "offer") {
    //         //console.log("Offer Recieved")
    //         InitaliseOffer();
    //         return true;
    //     }

    //     else if (message.type == "answer") {
    //         //console.log("Answer Recieved")
    //         InitaliseAnswerer();
    //     }
    // });
    socket.on("hangup", () => {
        //console.log("hangup receved");
        HangUp();
    });
}
const InitaliseOffer = async () => {
    pc = new RTCPeerConnection(configuration);
    if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }
    handlePC(pc);
    ListenForIceCandidate(socket, pc);
    // only offer can create the data cahnnel
    dataChannel = pc.createDataChannel("chat");
    handelDataChannel(dataChannel, partnerIntrests);

    // Offer Creation
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    //console.log('Offer Created:', offer);
    SendOffer(offer, partnerID);

    ListenForAnswer(socket, pc);
}
const InitaliseAnswerer = () => {
    pc = new RTCPeerConnection(configuration);
    if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }
    handlePC(pc);
    // Answerer Will not create the data channel
    ListenForIceCandidate(socket, pc);
    ListenForOffer(socket, pc);
}

const handlePC = (pc) => {
    pc.onicecandidate = (e) => {
        if (e.candidate) {
            // console.log('New Ice Candidate:', JSON.stringify(e.candidate));
            SendCandidate(e.candidate, partnerID);
        }
    };


    // Handel Status
    HandelStatus(pc);

    pc.ontrack = (e) => {
        //console.log('New Track:', e.streams[0]);
        HandleRemoteStream(e.streams[0]);
    };
    pc.onnegotiationneeded = async () => {
        console.log('Negotiation Needed');
    };
    pc.ondatachannel = (e) => {
        //console.log('New Data Channel:', e.channel);
        handelDataChannel(e.channel, partnerIntrests);
    };
}

const HandelStatus = (pc) => {

    // webrtc status updaters
    function updateState(stateName, newValue) {
        try {
            document.getElementById(stateName).textContent = newValue;
        } catch (e) {
            //console.log(e);
        }
    }
    // Event listeners for state changes
    pc.addEventListener('connectionstatechange', () => {
        updateState('connection-state', pc.connectionState);
        if (pc.connectionState === "connected") {
            updateWaitForPartner(`Connected with parnter (${partnerID})`);
        }
        else if (pc.connectionState === "disconnected") {
            updateWaitForPartner(`Disconnected with parnter (${partnerID})`);
            partnerID = null;
            HangUp();
        }
    });
    pc.addEventListener('iceconnectionstatechange', () => {
        updateState('ice-connection-state', pc.iceConnectionState);
    });
    pc.addEventListener('icegatheringstatechange', () => {
        updateState('ice-gathering-state', pc.iceGatheringState);
    });
    pc.addEventListener('signalingstatechange', () => {
        updateState('signaling-state', pc.signalingState);
    });
    updateState('connection-state', pc.connectionState);
    updateState('ice-connection-state', pc.iceConnectionState);
    updateState('ice-gathering-state', pc.iceGatheringState);
    updateState('signaling-state', pc.signalingState);
}

//Socket Event Listening
const ListenForAnswer = (socket, pc) => {
    socket.on("answer", async (answer) => {
        try {
            await pc.setRemoteDescription(answer);
        } catch (error) {
            console.error("Error setting remote description:", error);
        }
    });
    window.dataChannel = dataChannel;
    window.pc = pc;

}
const ListenForOffer = (socket, pc) => {
    socket.on("offer", async (offer) => {
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        SendAnswer(answer, partnerID);
        window.pc = pc;
    });
}
const ListenForIceCandidate = (socket, pc) => {
    socket.on("candidate", async (candidate) => {
        try {
            await pc.addIceCandidate(candidate);
        } catch (e) {
            console.error("Error Adding Ice Candidate", e);
        }
    });
}

const HangUp = () => {
    console.log("Hangup Called");
    // if (startCallBtn) {
    //     startCallBtn.disabled = false;
    // }
    // handUpBtn.disabled = true;

    if (pc) {
        pc.close();
    }
    if (dataChannel) {
        dataChannel.close();
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    partnerID = null;
    dataChannel = null;
    localStream = null;
    pc = null;
    window.pc = null
    socket = null;
    // webrtc status updaters
    function updateState(stateName, newValue) {
        try {
            document.getElementById(stateName).textContent = newValue;
        } catch (e) {
            // console.log(e);
        }
    }
    updateState('connection-state', "------------");
    updateState('ice-connection-state', "------------");
    updateState('ice-gathering-state', "------------");
    updateState('signaling-state', "------------");
    // Waiting for partner Status
    updateWaitForPartner("----------");

}
const SendHungUpFunction = () => {
    try {
        //console.log("Hangup Clicked");
        if (window.partnerID !== null) {
            SendHangUP("bye", partnerID);
            HangUp();
            //console.log("Hangup Sent");
        }
        else {
            console.log("No Partner ID Found");
        }
    }
    catch (e) {
        // console.log(e);
    }
}
if (handelLikes) {
    handelLikes(likes);
    window.likes = likes;
}

export { StartCall, HangUp, SendHungUpFunction, likes, partnerID, Socket }
