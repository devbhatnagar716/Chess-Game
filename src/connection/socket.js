
import io from 'socket.io-client';

const URL = 'http://localhost:3000'; 

const socket = io(URL);

let mySocketId = null; // Use `let` instead of `var` for block-scoped variables

// Register preliminary event listeners here
socket.on('createNewGame', (statusUpdate) => {
    console.log(`A new game has been created! Username: ${statusUpdate.userName}, Game id: ${statusUpdate.gameId}, Socket id: ${statusUpdate.mySocketId}`);
    mySocketId = statusUpdate.mySocketId;
});

// Export the socket instance and the variable
export {
    socket,
    mySocketId
};

