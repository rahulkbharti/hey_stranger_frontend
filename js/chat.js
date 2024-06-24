/*****************************************
 * REfacted in another way
 ****************************************/
import { MessageBox, chatBody, SendMessage } from "./elements.js";

const escMainText = document.getElementById("esc-main-text");

const handelDataChannel = (dataChannel, partnerIntrests) => {
    document.getElementById(MessageBox).disabled = true;
    console.log("handeling data channel:", dataChannel, partnerIntrests)
    dataChannel.onopen = () => {
        document.getElementById(MessageBox).disabled = false;
        if (chatBody) {
            var urlParams = new URLSearchParams(window.location.search);
            var arrayParam = urlParams.get('tags');
            let yourslikes = JSON.parse(decodeURIComponent(arrayParam));
            chatBody.innerHTML ="";
            // chatBody.innerHTML = "<small style='color:white;margin:10px 0;'>You're now chatting with a random stranger. Say hi!</small>";
            // chatBody.innerHTML += `<div class="chat-message system">You're now chatting with a random stranger.</div>`;
            if ((yourslikes && yourslikes.length > 0) && (partnerIntrests && partnerIntrests.length > 0)) {
                const coomonIntrest = partnerIntrests.filter(value => yourslikes.includes(value));
                chatBody.innerHTML += `<div class="chat-message system"><small style='color:white; margin:20px 0;'>You both likes:${coomonIntrest.map((like) => "<b>" + like + "</b>")} .</small></div>`;
            } else {
                chatBody.innerHTML += `<div class="chat-message system"><small style='color:white;margin:20px 0;'>You are cnnected with a completly random stranger.</small></div>`;
            }

            // if(yourslikes && yourslikes.length>0){
            //     chatBody.innerHTML += `<div class="chat-message system"><small style='color:blue;'>Your's likes:${yourslikes.map((like)=> "<b>"+like+"</b>")} .</small></div>`;

            // }
            // if(partnerIntrests && partnerIntrests.length>0){
            //     chatBody.innerHTML += `<div class="chat-message system"><small style='color:blue;'>Stranger's likes:${partnerIntrests.map((like)=> "<b>"+like+"</b>")} .</small></div>`;

            // }


        }

        if (escMainText) {
            escMainText.textContent = "Click to disconnect";
        }
    }
    dataChannel.onmessage = (e) => {
        console.log("Message:", e.data);
        let data = JSON.parse(e.data);
        if (chatBody) {
            if (data.type == "chat") {
                chatBody.innerHTML += `<div class="message received">
                <div class="avatar">S</div>
                <div class="message-text">${data.content}</div>
              </div>`;
                escMainText.textContent = "Click to disconnect";
                chatBody.scrollTop = chatBody.scrollHeight;
            }
            else if (data.type == "typing") {
                if (data.isTyping) {
                    escMainText.textContent = "Stranger is typing...";
                }
                else {
                    escMainText.textContent = "Click to disconnect";
                }
            }

        } else {
            alert("Chat Box Not Found");
        }
    }
    dataChannel.onclose = () => {
        console.log("Data channel is closed");
        document.getElementById(MessageBox).disabled = true;
        if (chatBody) {
            chatBody.innerHTML += "<small style='color:white;margin:20px 0;'> Stranger is Disconnected...</small>";
            chatBody.scrollTop = chatBody.scrollHeight;
        }
        if (escMainText) {
            escMainText.textContent = "Click to connect";
        }
    }
    dataChannel.onerror = (e) => {
        console.error("Data channel error:", e);
    }

    const chatInput = document.getElementById(MessageBox);
    const sendBtn = document.getElementById(SendMessage);
    const clonedChatInput = chatInput.cloneNode(true);
    chatInput.parentNode.replaceChild(clonedChatInput, chatInput);
    const clonedSendBtn = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(clonedSendBtn, sendBtn);

    // Add event listeners to the cloned elements
    if (clonedChatInput && clonedSendBtn && chatBody) {
        clonedChatInput.addEventListener('keydown', function (event) {
            const tagText = event.target.value.trim();
            if (event.key === 'Enter' && tagText !== '') {
                dataChannel.send(JSON.stringify({ type: "chat", content: clonedChatInput.value })); // Assuming dataChannel is defined somewhere
                chatBody.innerHTML += `<div class="message sent">
                <div class="message-text">${clonedChatInput.value}</div>
              </div>`;
                clonedChatInput.value = "";
                chatBody.scrollTop = chatBody.scrollHeight;
                clonedChatInput.focus();

            }
        });

        clonedSendBtn.addEventListener("click", () => {
            const tagText = clonedChatInput.value.trim();
            if (tagText !== '') {
                dataChannel.send(JSON.stringify({ type: "chat", content: clonedChatInput.value })); // Assuming dataChannel is defined somewhere
                chatBody.innerHTML += `<div class="message sent">
                <div class="message-text">${clonedChatInput.value}</div>
              </div>`;
                clonedChatInput.value = "";
                chatBody.scrollTop = chatBody.scrollHeight;
                clonedChatInput.focus();
            }
        });
    }

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
    clonedChatInput.addEventListener('input', () => {
        startTyping();
    });
}

export { handelDataChannel }