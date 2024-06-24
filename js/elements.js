/***************************************************************************** *
 *  STRUCTURE WILL BE DEFINED HERE
 *  1. get all the nessasery document to changess
 *    (i) local-video , remote-video
 *    (ii) chat body
 *    (III) All Chats
 * 
******************************************************************************* */

// All Impotant Element;

let STRUCTURE = {
    RemoteVideo : "remote-video",     // Remote Video
    LocalVideo : "local-video",       // Local Video
    MuteVideo : "video-button",         // Mute/Unmute Video
    MuteAudio : "mute-button",         // Mute/Unmute Audio
    Chats : {
        ChatBody : "chat",    // Chat Body
        ConnectDisconnect: "esc-btn",  // Connect/Disconnect button
        SendMessage : "send-btn",      // Send button
        MessageBox : "message-input",  // Input for Message
        TypingIndicator: "is-typing"   // typing Indicator
    },
    Info :{
        TotalUsers:"total-users"      // Total Users Info
    }

}
let COMPONENT = {
    remoteVideo: document.getElementById(STRUCTURE.RemoteVideo),
    localVideo: document.getElementById(STRUCTURE.LocalVideo),
    muteVideoButton: document.getElementById(STRUCTURE.MuteVideo),
    muteAudioButton: document.getElementById(STRUCTURE.MuteAudio),
    chatBody: document.getElementById(STRUCTURE.Chats.ChatBody),
    connectDisconnectButton: document.getElementById(STRUCTURE.Chats.ConnectDisconnect),
    sendMessageButton: document.getElementById(STRUCTURE.Chats.SendMessage),
    messageBox: document.getElementById(STRUCTURE.Chats.MessageBox),
    typingIndicator : document.getElementById(STRUCTURE.Chats.TypingIndicator),
    totalUsers : document.getElementById(STRUCTURE.Info.TotalUsers)
};

export const { MessageBox: MessageBox,SendMessage } = STRUCTURE.Chats;
export const { remoteVideo, localVideo, muteVideoButton, muteAudioButton, chatBody, connectDisconnectButton, sendMessageButton, messageBox , typingIndicator ,totalUsers} = COMPONENT;





