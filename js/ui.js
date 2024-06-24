/*************************************************
 * Refactered
 *  There is no commonets 
 **************************************************/

import { chatBody,connectDisconnectButton as EscBtn ,totalUsers} from "./elements.js";

import { StartCall, SendHungUpFunction, likes, partnerID, Socket } from "./main.js";

const escMainText = document.getElementById("esc-main-text");

// Wait For Partner WEBRTC (For Testing Only)
const waitForPrtner = document.getElementById("wait-for-partner");
const updateWaitForPartner = (status) => {
    if (waitForPrtner) {
        waitForPrtner.textContent = status;
    }
}

// How Many User Online UI (Depend on socket)
Socket.on("status", (state) => {
    if (totalUsers) {
        totalUsers.textContent = `${state.totalusers}00+ users`;
    }
    console.log("totol users");
});

// Connection Close and Open UI (Start and End Call Depend On main.js)
let confirmExit = false;

const EscapeHandel = () => {
    if (partnerID) {
        if (!confirmExit) {
            confirmExit = true;
            // escMainText.textContent = "Are you sure you want to leave the chat?";
            //escMainText.textContent = "आप चैट छोड़ना चाहते हैं क्या?";
            escMainText.textContent = "Really?";
            return;
        }
        //escMainText.textContent = "Leaving...";
        //escMainText.textContent = "छोड़ रहा है...";
        escMainText.textContent = "Connect";
        confirmExit = false;
        SendHungUpFunction();
        return;
    }
    confirmExit = false;
    escMainText.textContent = "Connecting";
    EscBtn.disabled = true;
    if (chatBody) {
        chatBody.innerHTML = ` 
        <p>Looking for someone you can chat with ...</p>
        <small>
            It may take a little while to find someone with common interests. If you get tired of
            waiting, you can connect to a <a href="#">completely random stranger</a> instead.
        </small>`
    }
    StartCall(likes);
}


// SConnection Close and Open UI (Start and End Call Depend On main.js) with keyboard Intraction
if (EscBtn) {
    EscBtn.addEventListener("click", EscapeHandel);
}
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        EscapeHandel();
    }
});


// Video Control API (Hide the video when textmode is opend)
const videoContainer = document.getElementById("video-containers");
if (videoContainer) {
    let urlParams = new URLSearchParams(window.location.search);
    let mode = urlParams.get('mode');
    if (mode === "text") {
        videoContainer.style.display = "none";
    }
    else {
        videoContainer.style.display = "block";
    }
}


export { updateWaitForPartner }