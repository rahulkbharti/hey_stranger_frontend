// Getting to UI components this module can do its works independent-ally
const localVideo =  document.getElementById("local_video");
const muteAudioButton = document.getElementById("");
const muteVideoButton = document.getElementById("");
const getStream = async () => {
    let localStream;
    const configuration = {
        video: {
            width: { exact: 320 },
            height: { exact: 240 },
            frameRate: { ideal: 30 },
            facingMode: 'user', // or 'user' for front-facing camera
            aspectRatio: 4/3, // Example aspect ratio constraint
            // Add more video constraints as needed
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true, // Enable automatic gain control
            sampleRate: { ideal: 48000 }, // Ideal sample rate (Hz)
            channelCount: { ideal: 2 },   // Ideal number of audio channels (stereo)
            latency: { max: 0.02 }, // Maximum acceptable latency (seconds)
            // Add more audio constraints as needed
        },
    };
    try{
        localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    } catch (e) {
        console.error("Error Getting User Media", e);
        alert("Please allow the camera and microphone access for video call access");
        return null;
    }
    // const localVideo = localVideo;
    let isAudioMuted = true;
    let isVideoMuted = false;

    // // Video Audio Muting/Unmuting
    // if (localStream) {
    //     localVideo?.style && (localVideo.style.transform = 'scaleX(-1)');
    //     // const muteAudioButton = document.getElementById("mute-audio");
    //     // const muteVideoButton = document.getElementById("mute-video");
    //     if (muteAudioButton) {
    //         const audioTracks = localStream.getAudioTracks();
    //         audioTracks.forEach(track => {
    //             track.enabled = false;
    //         });
    //         muteAudioButton.addEventListener("click", () => {
    //             if (!localStream) return;
    //             if (audioTracks.length === 0) return;
    //             isAudioMuted = !isAudioMuted;
    //             audioTracks.forEach(track => {
    //                 track.enabled = !isAudioMuted;
    //             });
    //             muteAudioButton.innerHTML = isAudioMuted ? '<i class="material-icons icon">mic_off</i>' : '<i class="material-icons icon">mic</i>';
    //         });
    //     }
    //     if (muteVideoButton) {
    //         muteVideoButton.addEventListener("click", () => {
    //             if (!localStream) return;
    //             const videoTracks = localStream.getVideoTracks();
    //             if (videoTracks.length === 0) return;
    //             isVideoMuted = !isVideoMuted;
    //             videoTracks.forEach(track => {
    //                 track.enabled = !isVideoMuted;
    //             });
    //             muteVideoButton.innerHTML = isVideoMuted ? '<i class="material-icons icon">videocam_off</i>' : '<i class="material-icons icon">videocam</i>';
    //         });
    //     }
    // }
    // // Local video stream
    // if (localVideo) {
    //     localVideo.srcObject = localStream;
    // }
    return localStream;
}

export { getStream };