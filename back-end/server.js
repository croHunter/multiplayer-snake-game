const io = require('socket.io')();
const { makeId } = require('./util');
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const state = {}; //global state of game
const clientRooms = {}; //lookup table
/*
clientRooms={'client.id':'roomName/gameCode'}=>{'slfdjsdf':'rwerw'}

clientRooms[client.id]==>'roomName/gamecode'
clientRooms['slfdjsdf']==>'rwerw'
*/
io.on('connection', (client) => {
  client.on('keydown', handleKeyDown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(gameCode) {
    //game needs to exist in a first place &
    //need to have a another player waiting to play you
    const room = io.sockets.adapter.rooms[gameCode]; //creating a gameCode room on sockets
    let allPlayer; //allUser
    if (room) {
      allPlayer = room.sockets; //players (object) in socket room
    }
    let totalNumPlayers = 0; //numClients//numUsers
    if (allPlayer) {
      totalNumPlayers = Object.keys(allPlayer).length;
    }
    if (totalNumPlayers === 0) {
      client.emit('unknownGame');
      return; //exit funciton
    } else if (totalNumPlayers > 1) {
      client.emit('tooManyPlayers');
      return; //exit funciton
    }
    //if we get through above  two condition there is only one player is waiting
    clientRooms[client.id] = gameCode;
    client.join(gameCode);
    client.number = 2;
    client.emit('init', 2);
    startGameInterval(gameCode);
  }

  function handleNewGame() {
    let roomName = makeId(5);
    clientRooms[client.id] = roomName; //each client has own clientId with server-generated-roomID
    client.emit('gameCode', roomName);

    state[roomName] = initGame(); //create a state as soon as client connect to the server//  state={'roomName':{}}
    client.join(roomName);
    client.number = 1; //playerOne
    client.emit('init', 1);
  }

  function handleKeyDown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return; //exit function
    }

    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);
    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]); //passing current state of that room

    if (!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null; //reset the state of that room
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(roomName, state) {
  io.sockets.in(roomName).emit('gameState', JSON.stringify(state)); //saying to socket.io emit to all clients (2) in roomName
}

function emitGameOver(roomName, winner) {
  io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner })); //saying to socket.io emit to all clients (2) in roomName
}
io.listen(3000);
