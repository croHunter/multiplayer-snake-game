const { GRID_SIZE } = require('./constants');
function initGame() {
  const state = createGameState();
  randomFood(state); //initially setting the position of food in random manner
  return state;
}
function createGameState() {
  return {
    players: [
      {
        pos: {
          x: 3,
          y: 10,
        },
        vel: {
          x: 1,
          y: 0,
        },
        snake: [
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 3, y: 10 },
        ],
      },
      {
        pos: {
          x: 18,
          y: 10,
        },
        vel: {
          x: 0,
          y: 0,
        },
        snake: [
          { x: 19, y: 10 },
          { x: 18, y: 10 },
          { x: 17, y: 10 },
        ],
      },
    ],
    food: {}, //randomized
    gridSize: GRID_SIZE,
  };
}
function gameLoop(state) {
  if (!state) {
    return;
  }
  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  //updating the position(x,y) of playerOne by velocity(x,y)
  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  //updating the position(x,y) of playerTwo by velocity(x,y)
  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  //if playerOne tries to go out of boundary
  if (
    playerOne.pos.x < 0 ||
    playerOne.pos.x > GRID_SIZE ||
    playerOne.pos.y < 0 ||
    playerOne.pos.y > GRID_SIZE
  ) {
    return 2; //player 2 wins
  }

  //if playerTwo tries to go out of boundary
  if (
    playerTwo.pos.x > GRID_SIZE ||
    playerTwo.pos.y < 0 ||
    playerTwo.pos.x < 0 ||
    playerTwo.pos.y > GRID_SIZE
  ) {
    return 1; //player 1 wins
  }

  //if food and playerOne position(headposition) is in same position or eating a food
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos });

    //updating the position(x,y) of playerOne by velocity(x,y)
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    randomFood(state);
  }

  //if food and playerTwo position(headposition) is in same position or eating a food
  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    playerTwo.snake.push({ ...playerTwo.pos });

    //updating the position(x,y) of playerTwo by velocity(x,y)
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    randomFood(state);
  }

  //if playerOne is still moving
  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      //if bumped into itself
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2; //player 2 wins
      }
    }
    //while moving always pushing new position and poping old position to the snake
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  //if playerTwo is still moving
  if (playerTwo.vel.x || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
      //if bumped into itself
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        return 1; //player 1 wins
      }
    }
    //while moving always pushing new position and poping old position to the snake
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }

  return false; //there is no winner or still in the game
}

function randomFood(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
  for (let cell of state.players[0].snake) {
    //checking if new food is on top of the playerOne
    //to avoid food on  on top of the playserOne
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }
  for (let cell of state.players[1].snake) {
    //checking if new food is on top of the playerTwo
    //to avoid food on  on top of the playerTwo
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }
  state.food = food;
}
function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37: {
      //left
      return { x: -1, y: 0 };
    }
    case 38: {
      //down
      return { x: 0, y: -1 };
    }
    case 39: {
      //right
      return { x: 1, y: 0 };
    }
    case 40: {
      //up
      return { x: 0, y: 1 };
    }

    default:
      break;
  }
}
module.exports = { initGame, gameLoop, getUpdatedVelocity };
