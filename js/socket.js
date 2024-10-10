// Need <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script> in header to use io
// const socket = io("https://heystranger-services-new.azurewebsites.net");
// const socket = io("http://192.168.43.121:3000");

const socket = io("http://localhost:3000");
// Socket Listeners and Caller
const getMatch = (userData) => socket.emit("match", userData);
const onMatch = (callback) => socket.on("match", callback);
const onNoMatch = (callback) => socket.on("noMatch", callback);
const onError = (callback) => socket.on("error", callback);
const hangUp = (toSocketId) => socket.emit("hangUp", toSocketId);
const onHangup = (callback) => socket.on("hangUp", callback);


// WebRTCPeerConnection Callers:
// Callers
const sendOffer = (offer, toSocketId) => socket.emit('offer', offer, toSocketId);
const sendAnswer = (answer, toSocketId) => socket.emit('answer', answer, toSocketId);
const sendIceCandidate = (candidate, toSocketId) => socket.emit('iceCandidate', candidate, toSocketId);

// Web RTC Listeners
const onOffer = (callback) => socket.on("offer", callback);
const onAnswer = (callback) => socket.on("answer", callback);
const onIceCandidate = (callback) => socket.on("iceCandidate", callback);
const removerListeners = () => {
    socket.removeAllListeners();
    console.log("all listener removed.");
}
export {
    getMatch,
    onMatch,
    onNoMatch,
    onError,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    onOffer,
    onAnswer,
    onIceCandidate,
    hangUp,
    onHangup,
    removerListeners
};
