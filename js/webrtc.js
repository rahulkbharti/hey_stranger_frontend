

import { sendIceCandidate } from './socket.js';
import { getStream } from "./stream.js";

const peerConnections = {};

const createPeerConnection = async(userId, localStream)=> {
    window.peerConnection = new RTCPeerConnection();
    peerConnections[userId] = peerConnection;
    window.pc = peerConnection;
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate !== null) {
            sendIceCandidate(event.candidate, userId)
            console.log("Sending IceCandidate to :",userId);
        }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
        try{
            const remoteVideo = document.getElementById('remote-video');
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.autoplay = true;
            // remoteVideo.id = userId;
        }
        catch (e){

        }
        // document.getElementById('videos').appendChild(remoteVideo);
    };

    // Add local stream to peer connection
    if(localStorage.getItem("type") === "video"){
        let localStream1 = await getStream();
        // let localStream1 = false;
        if (localStream1) {
            console.log("local-stream Found")
            localStream1.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream1);
                console.log("Adding the stream");
            });
        }
    }

    return peerConnection;
}

function getPeerConnection(userId) {
    return peerConnections[userId];
}

function closePeerConnection(userId) {
    const peerConnection = peerConnections[userId];
    if (peerConnection) {
        peerConnection.close();
        peerConnection.onicecandidate = null;
        peerConnection.ontrack = null;
        peerConnection.oniceconnectionstatechange = null;
        peerConnection.onicegatheringstatechange = null;
        peerConnection.onsignalingstatechange = null;
        peerConnection.onnegotiationneeded = null;

        peerConnection.getSenders().forEach(sender => {
            if (sender.track) {
                sender.track.stop();
            }
        });

        peerConnection.getReceivers().forEach(receiver => {
            if (receiver.track) {
                receiver.track.stop();
            }
        });



        // document.getElementById(userId)?.remove(); // Remove the video element
        delete peerConnections[userId];
        delete window.peerConnection;
    }
}

export { createPeerConnection, getPeerConnection, closePeerConnection };