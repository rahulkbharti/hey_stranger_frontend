/*************************************************
 * Refactered
 *  There is no commonets 
 **************************************************/

let server = "https://heystranger-services.azurewebsites.net/";
const socket = io(server);

// socket.emit('offer', offer, id, (response) => {
//     if (response.status === 'ok') {
//         console.log('Offer Sent Successfully');
//     } else {
//         console.error('Error Sending Offer');
//     }
// });


const UpdateSocketStatus = (status) => {
    const socketStatus = document.getElementById("socket-status");
    if (socketStatus) {
        if (status == "Connected") {
            socketStatus.textContent = `${status} to server , ID is:(${socket.id})`;
        }
        else {
            socketStatus.textContent = `${status} to server`;
        }

    }
};
socket.on("connect", () => {
    console.log("Connected to server");
    UpdateSocketStatus("Connected");
});
socket.on("disconnect", () => {
    console.log("Disconnected from server");
    UpdateSocketStatus("Disconnected");
});
socket.on("reconnect", () => {
    console.log("Reconnected to server");
    UpdateSocketStatus("Reconnected");
});
socket.on("error", (error) => {
    console.error("Error:", error);
    UpdateSocketStatus("Error");
});


const getPartner = (interests) => {
    return new Promise((resolve, reject) => {
        socket.emit('getPartner', interests, (response) => {
            resolve(response);
        });

        // Handle timeout if acknowledgment is not received within 5 seconds
        setTimeout(() => {
            reject(new Error('Timeout: Acknowledgment not received within 5 seconds'));
        }, 30000);
    });
};
// Function to send 'candidate' event with acknowledgment and handle timeout
const SendCandidate = (candidate, id) => {
    return new Promise((resolve, reject) => {
        socket.emit('candidate', candidate, id, (response) => {
            resolve(response); // Resolve with response from server
        });

        // Handle timeout if acknowledgment is not received within 1.5 seconds (1500ms)
        setTimeout(() => {
            reject(new Error('Timeout: Acknowledgment not received within 1500ms'));
        }, 1500);
    });
};

// Function to send 'offer' event with acknowledgment and handle timeout
const SendOffer = (offer, id) => {
    return new Promise((resolve, reject) => {
        socket.emit('offer', offer, id, (response) => {
            resolve(response); // Resolve with response from server
        });

        // Handle timeout if acknowledgment is not received within 1.5 seconds (1500ms)
        setTimeout(() => {
            reject(new Error('Timeout: Acknowledgment not received within 1500ms'));
        }, 1500);
    });
};

// Function to send 'answer' event with acknowledgment and handle timeout
const SendAnswer = (answer, id) => {
    return new Promise((resolve, reject) => {
        socket.emit('answer', answer, id, (response) => {
            resolve(response); // Resolve with response from server
        });

        // Handle timeout if acknowledgment is not received within 1.5 seconds (1500ms)
        setTimeout(() => {
            reject(new Error('Timeout: Acknowledgment not received within 1500ms'));
        }, 1500);
    });
};

// Function to send 'hangup' event with acknowledgment and handle timeout
const SendHangUP = (message, id) => {
    return new Promise((resolve, reject) => {
        socket.emit('hangup', message, id, (response) => {
            resolve(response); // Resolve with response from server
        });

        // Handle timeout if acknowledgment is not received within 1.5 seconds (1500ms)
        setTimeout(() => {
            reject(new Error('Timeout: Acknowledgment not received within 1500ms'));
        }, 1500);
    });
};

export {
    socket,
    getPartner,
    SendCandidate,
    SendOffer,
    SendAnswer,
    SendHangUP
}
