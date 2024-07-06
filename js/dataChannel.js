// dataChannel.js
/*
   The Thing I will Do in it is :
   1. Update the ChatBox with On message event.
   2. Send Button Functionality
   3. Typing indicator
 */

// All Module imports
import { setIsConnected } from "./ui.js";
// All DOM access
import {chatBody, typingIndicator, messageBox,sendMessageButton } from "./doms.js";

// GLOBAL Variable
let dataChannel;
const createDataChannel = (peerConnection, label = "default") => {
    dataChannel = peerConnection.createDataChannel(label);
    setupDataChannelHandlers(dataChannel);
    return dataChannel;
};
const startMessage = () =>{
    let type = "text";
    if(localStorage.getItem("type") === "text"){
        type = "video";
    }
    else{
        type = "text";
    }

  return  `
                             <div class="start-chating">
                                <h3>Start Chat</h3>
                                <div class="buttons-groups">
                                    <span>Want to switch to </span>
                                    <button type="button" style="text-transform: capitalize;" onclick="StartChatting('${type}')">${type} Chat</button>
                                </div>
                            </div>
    `
}
const setupDataChannelHandlers = (dataChannel_) => {
    dataChannel =  dataChannel_;
    dataChannel.onopen = () => {
            setIsConnected(true);
            console.log("Data channel opened");
            messageBox.disabled = false;
            chatBody.innerHTML ="<div style='margin:15px 0;'><b>You are now connected</b></div>";
            typingIndicator.innerHTML ="Connected";
    };
    dataChannel.onclose = () => {
        setIsConnected(false);
        messageBox.disabled = true;
        chatBody.innerHTML += "<div style='margin:15px 0;'><small style='color:red;margin:30px 0;'> Stranger is Disconnected...</small></div>";
        chatBody.innerHTML+= startMessage();
        chatBody.scrollTop = chatBody.scrollHeight;
        console.log("Data channel closed");
        typingIndicator.innerHTML ="Connect";
    };
    dataChannel.onmessage = (e) => {
        console.log("Message:", e.data);
        let data = JSON.parse(e.data);
        if (chatBody) {
            if (data.type === "chat") {
                chatBody.innerHTML += `<div class="message received">
                <div class="avatar">S</div>
                <div class="message-text">${data.content}</div>
              </div>`;
                typingIndicator.textContent = "Click to disconnect";
                chatBody.scrollTop = chatBody.scrollHeight;
            }
            else if (data.type === "typing") {
                if (data.isTyping) {
                    typingIndicator.textContent = "Stranger is typing...";
                }
                else {
                    typingIndicator.textContent = "Click to disconnect";
                }
            }

        } else {
            alert("Chat Box Not Found");
        }
    }
    dataChannel.onerror = (error) => {
        setIsConnected(false);
        console.error("Data channel error:", error)
    };
};

const sendMessage = (message) => {
    // dataChannel =  window.dataChannel;
    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(message);
        console.log("Message sent:", message);
    }
    else {
        console.error("Data channel is not open");
    }
};

const closeDataChannel = () => {
    if (dataChannel) {
        dataChannel.close();
        console.log("Data channel closed");
    }
};


//  SendMessage Functionalities
let typingTimeout; // Variable to store typing timeout
// Function to send typing indicator when user starts typing
function startTyping() {
    if (!typingTimeout) {
        dataChannel.send(JSON.stringify({ type: 'typing', isTyping: true }));
    } else {
        clearTimeout(typingTimeout);
    }

    // Set timeout to send typing indicator after a delay when user stops typing
    typingTimeout = setTimeout(() => {
        dataChannel.send(JSON.stringify({ type: 'typing', isTyping: false }));
        typingTimeout = null;
    }, 1000); // Adjust the delay as needed
}
messageBox.addEventListener('input', () => {
    startTyping();
});

// Send message By Button
if(sendMessageButton){
    sendMessageButton.onclick =()=>{
        if(chatBody){
            chatBody.innerHTML+=`<div class="message sent">
                <div class="message-text">${messageBox.value}</div>
              </div>`;
            chatBody.scrollTop = chatBody.scrollHeight;
            sendMessage(JSON.stringify({ type: "chat", content: messageBox.value }));
            messageBox.value ="";
            messageBox.focus();
        }else{
            console.error({
                message:"chatBody not found",
                module:'dataChannel'
            })
        }
    }
}
else{
    console.error({
        message:"No Send Button Found.",
        module:"dataChannel"
    })
}
// Send Message by clicking enter button
if(messageBox) {
    messageBox.addEventListener('keydown', function (event) {
        const tagText = event.target.value.trim();
        if (event.key === 'Enter' && tagText !== '') {
            sendMessage(JSON.stringify({type: "chat", content: messageBox.value})); // Assuming dataChannel is defined somewhere
            chatBody.innerHTML += `<div class="message sent">
                <div class="message-text">${messageBox.value}</div>
              </div>`;
            chatBody.scrollTop = chatBody.scrollHeight;
            messageBox.value = "";
            chatBody.scrollTop = chatBody.scrollHeight;
            messageBox.focus();

        }
    });
}



export {createDataChannel, setupDataChannelHandlers, closeDataChannel}
