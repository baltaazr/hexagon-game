singleHexagonGreedySearch = (problem, hexagon) => {
  if (p5.Vector.dist(problem.cords, hexagon.cords) === 0) {
    return hexagon;
  }
  let queue = [];
  let surroundings = [
    createVector(-1, 1, 0),
    createVector(0, 1, -1),
    createVector(1, 0, -1),
    createVector(1, -1, 0),
    createVector(0, -1, 1),
    createVector(-1, 0, 1)
  ];
  for (let i = 0; i < surroundings.length; i++) {
    const surrounding = surroundings[i];
    let surroundingCords = p5.Vector.add(hexagon.cords, surrounding);
    if (
      surroundingCords.x < mapsize &&
      surroundingCords.y < mapsize &&
      surroundingCords.z < mapsize &&
      surroundingCords.x > -mapsize &&
      surroundingCords.y > -mapsize &&
      surroundingCords.z > -mapsize
    ) {
      queue.push({ cords: surroundingCords });
    }
  }
  while (queue.length > 0) {
    let qIndex = 0;
    for (let nodeIndex = 0; nodeIndex < queue.length; nodeIndex++) {
      if (
        p5.Vector.dist(queue[qIndex].cords, problem.cords) >
        p5.Vector.dist(queue[nodeIndex].cords, problem.cords)
      ) {
        qIndex = nodeIndex;
      }
    }
    return queue[qIndex];
  }
  return null;
};

let HEXSIZE = 25;
let h = HEXSIZE * Math.sqrt(3);
let w = HEXSIZE * 2;
let mapsize = 5;
let timeInterval = 5000;
let start = false;
let map = [];
let player = null;
let enemies = null;
let finish = null;
let time = 0;

function setup() {
  createCanvas(windowWidth, windowHeight - 4);
  imageMode(CENTER);
  angleMode(DEGREES);
  player = { cords: createVector(0, 0, 0) };
  startButton = createButton("START");
  startButton.position(0, 32);
  startButton.mouseClicked(startGame);
  difficultySlider = createSlider(1, 10, 2);
  difficultySlider.position(0, 64);
}

function draw() {
  if (start) {
    startButton.hide();
    difficultySlider.hide();
    push();
    fill(0);
    textSize(32);
    text(
      "Level " + (mapsize - 1) + ", Difficulty " + difficultySlider.value(),
      0,
      32
    );
    pop();
    push();
    fill(255, 0, 0);
    rect(30, 40, 500, 20);
    pop();
    push();
    fill(0, 255, 0);
    rect(30, 40, ((time - millis()) / timeInterval) * 500, 20);
    pop();
    push();
    let center = createVector(width / 2, height / 2);
    translate(center.x, center.y);
    if (
      (mapsize - 1) * h > height / 2 ||
      (mapsize - 1) * (3 / 4) * w > width / 2
    ) {
      console.log("SHRINK");
      HEXSIZE = HEXSIZE * 0.9;
      h = HEXSIZE * Math.sqrt(3);
      w = HEXSIZE * 2;
      drawMap();
    }
    if (millis() > time) {
      console.log("MOVE");
      for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
        let enemy = enemies[enemyIndex];
        let enemyCords = oddr_to_absolutecords(
          cube_to_oddq(
            createVector(enemy.cords.x, enemy.cords.y, enemy.cords.z)
          )
        );
        polygon(enemyCords.x, enemyCords.y, HEXSIZE, 6);
      }
      push();
      fill(0, 255, 0);
      let finishCords = oddr_to_absolutecords(
        cube_to_oddq(
          createVector(finish.cords.x, finish.cords.y, finish.cords.z)
        )
      );
      polygon(finishCords.x, finishCords.y, HEXSIZE, 6);
      pop();
      for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
        let enemy = enemies[enemyIndex];
        enemy.cords = singleHexagonGreedySearch(player, enemy).cords;
        push();
        fill(255, 0, 0);
        let enemyCords = oddr_to_absolutecords(
          cube_to_oddq(
            createVector(enemy.cords.x, enemy.cords.y, enemy.cords.z)
          )
        );
        polygon(enemyCords.x, enemyCords.y, HEXSIZE, 6);
        pop();
        if (p5.Vector.dist(enemy.cords, player.cords) === 0) {
          if (confirm("GAME OVER! Want to play again?")) {
            startGame();
          } else {
            start = false;
          }
        }
      }
      time = millis() + timeInterval;
    }

    pop();
  } else {
    startButton.show();
    difficultySlider.show();
    background(255);
    text("DIFFICULTY", 0, 100);
    text(
      "1. You're the black hexagon, you must reach the green hexagon without touching the red ones",
      0,
      115
    );
    text(
      "2. You move with QWE and ASD, Q and E move diagonally up, A and D move diagonally down, and W and S move up and down respectively",
      0,
      130
    );
    text(
      "3. Everytime the bar runs out, the red hexagons move one step towards you, watch out!",
      0,
      145
    );
    text(
      "4. Sometimes the red hexagons cover the green one, you must wait for them to move for them to reveal the green hexagon, it's called strategy!",
      0,
      160
    );
    text("5. Have fun!", 0, 175);
  }
}

function polygon(x, y, radius, npoints) {
  var angle = 360 / npoints;
  beginShape();
  for (var a = 0; a < 360; a += angle) {
    var sx = x + cos(a) * radius;
    var sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function cube_to_oddq(cube) {
  var col = cube.x;
  var row = cube.z + (cube.x - (cube.x & 1)) / 2;
  return createVector(col, row);
}

oddr_to_absolutecords = hex => {
  let row = hex.y * h;
  let col = hex.x * (3 / 4) * w;
  if (hex.x % 2 !== 0) {
    row += (1 / 2) * h;
  }
  return createVector(col, row);
};

function keyTyped() {
  push();
  let center = createVector(width / 2, height / 2);
  translate(center.x, center.y);
  let playerCords = oddr_to_absolutecords(
    cube_to_oddq(createVector(player.cords.x, player.cords.y, player.cords.z))
  );
  polygon(playerCords.x, playerCords.y, HEXSIZE, 6);
  let newCords = createVector(player.cords.x, player.cords.y, player.cords.z);
  if (key === "q") {
    newCords.x -= 1;
    newCords.y += 1;
  } else if (key === "w") {
    newCords.z -= 1;
    newCords.y += 1;
  } else if (key === "e") {
    newCords.x += 1;
    newCords.z -= 1;
  } else if (key === "a") {
    newCords.x -= 1;
    newCords.z += 1;
  } else if (key === "s") {
    newCords.z += 1;
    newCords.y -= 1;
  } else if (key === "d") {
    newCords.x += 1;
    newCords.y -= 1;
  }
  if (
    newCords.x < mapsize &&
    newCords.y < mapsize &&
    newCords.z < mapsize &&
    newCords.x > -mapsize &&
    newCords.y > -mapsize &&
    newCords.z > -mapsize
  ) {
    player.cords = newCords;
    if (p5.Vector.dist(player.cords, finish.cords) === 0) {
      levelUp();
      return;
    }
    for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
      let enemy = enemies[enemyIndex];
      if (p5.Vector.dist(enemy.cords, player.cords) === 0) {
        if (confirm("GAME OVER! Want to play again?")) {
          startGame();
          return;
        } else {
          start = false;
          return;
        }
      }
    }
  }
  push();
  fill(0);
  playerCords = oddr_to_absolutecords(
    cube_to_oddq(createVector(player.cords.x, player.cords.y, player.cords.z))
  );
  polygon(playerCords.x, playerCords.y, HEXSIZE, 6);
  pop();
  pop();
}

generateEnemies = n => {
  let enemies = [];
  for (let radius = 1; radius <= n; radius++) {
    for (let i = 0; i < radius; i++) {
      let cords = generateRandomHex(radius);
      enemies.push({ cords: createVector(cords.x, cords.y, cords.z) });
    }
  }
  return enemies;
};

generateRandomHex = n => {
  let x = 0;
  let y = 0;
  let z = 0;
  let a = Math.floor(random(1, 7));
  let b = Math.floor(random(1, n + 1));
  if (a === 1) {
    x = -n;
    y = b;
    z = -y - x;
  } else if (a === 2) {
    x = n;
    y = -b;
    z = -y - x;
  }
  if (a === 3) {
    y = -n;
    x = b;
    z = -y - x;
  } else if (a === 4) {
    y = n;
    x = -b;
    z = -y - x;
  }
  if (a === 5) {
    z = -n;
    y = b;
    x = -y - z;
  } else if (a === 6) {
    z = n;
    y = -b;
    x = -y - z;
  }
  return createVector(x, y, z);
};

startGame = () => {
  pop();
  start = true;
  mapsize = 2;
  player.cords = createVector(0, 0, 0);
  HEXSIZE = 25;
  h = HEXSIZE * Math.sqrt(3);
  w = HEXSIZE * 2;
  refreshMap();
  push();
  let center = createVector(width / 2, height / 2);
  translate(center.x, center.y);
  drawMap();
  pop();
  timeInterval = 1000 / (difficultySlider.value() / 10);
  time = millis() + timeInterval;
};

levelUp = () => {
  pop();
  mapsize += 1;
  player.cords = createVector(0, 0, 0);
  refreshMap();
  push();
  let center = createVector(width / 2, height / 2);
  translate(center.x, center.y);
  drawMap();
  pop();
  time = millis() + timeInterval;
};

refreshMap = () => {
  map = [];
  for (let n = 0; n < mapsize; n++) {
    for (let x = -n; x <= n; x++) {
      for (let y = -n; y <= n; y++) {
        for (let z = -n; z <= n; z++) {
          if (x + y + z === 0) {
            map.push({ cords: createVector(x, y, z) });
          }
        }
      }
    }
  }
  enemies = generateEnemies(mapsize - 1);
  finishInRed = true;
  while (finishInRed) {
    finish = { cords: generateRandomHex(mapsize - 1) };
    finishInRed = false;
    enemies.forEach(enemies => {
      if (p5.Vector.dist(enemies.cords, finish.cords) === 0) {
        finishInRed = true;
      }
    });
  }
};

drawMap = () => {
  background(255);
  for (let n = 0; n < map.length; n++) {
    const mapHex = map[n];
    let cords = oddr_to_absolutecords(
      cube_to_oddq(createVector(mapHex.cords.x, mapHex.cords.y, mapHex.cords.z))
    );
    polygon(cords.x, cords.y, HEXSIZE, 6);
  }
  push();
  fill(0, 255, 0);
  let finishCords = oddr_to_absolutecords(
    cube_to_oddq(createVector(finish.cords.x, finish.cords.y, finish.cords.z))
  );
  polygon(finishCords.x, finishCords.y, HEXSIZE, 6);
  pop();
  push();
  fill(0);
  let playerCords = oddr_to_absolutecords(
    cube_to_oddq(createVector(player.cords.x, player.cords.y, player.cords.z))
  );
  polygon(playerCords.x, playerCords.y, HEXSIZE, 6);
  pop();
  push();
  fill(255, 0, 0);
  for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
    const enemy = enemies[enemyIndex];
    let cords = oddr_to_absolutecords(
      cube_to_oddq(createVector(enemy.cords.x, enemy.cords.y, enemy.cords.z))
    );
    polygon(cords.x, cords.y, HEXSIZE, 6);
  }
  pop();
};
