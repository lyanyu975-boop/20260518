let video;
let handpose;
let predictions = [];

let playerChoice = "";
let aiChoice = "";
let resultText = "";

let winCount = 0;
let loseCount = 0;

let countdown = 3;
let lastSecond = 0;

let gameState = "countdown";

let gameOver = false;

function setup() {

  createCanvas(windowWidth, windowHeight);

  // 攝影機
  video = createCapture(VIDEO);

  video.size(640, 480);

  video.hide();

  // Handpose
  handpose = ml5.handpose(video, modelReady);

  handpose.on("predict", results => {

    predictions = results;

  });

  textAlign(CENTER, CENTER);

  lastSecond = millis();
}

function modelReady() {

  console.log("Handpose Ready");

}

function draw() {

  background("#c8b6ff");

  drawGameUI();

  drawCamera();

  drawTexts();

  checkControlGesture();

  if (!gameOver) {

    gameLogic();
  }

  else {

    fill(0, 180);

    rect(0, 0, width, height);

    fill(255);

    textSize(80);

    text(
      "GAME OVER",
      width / 2,
      height / 2
    );
  }
}

function drawGameUI() {

  // 外框
  fill("#5a189a");

  noStroke();

  rect(40, 40, width - 80, height - 80, 40);

  // 內框
  fill("#e0aaff");

  rect(80, 80, width - 160, height - 160, 30);

  // 按鈕
  fill("#240046");

  circle(width - 120, height - 100, 50);

  fill("#9d4edd");

  circle(width - 190, height - 100, 50);
}

function drawCamera() {

  let camW = width * 0.6;

  let camH = height * 0.55;

  let camX = width / 2 - camW / 2;

  let camY = height / 2 - camH / 2;

  push();

  // 修正鏡像
  translate(camX + camW, camY);

  scale(-1, 1);

  image(video, 0, 0, camW, camH);

  drawHand(camW, camH);

  pop();
}

function drawHand(camW, camH) {

  if (predictions.length > 0) {

    let landmarks = predictions[0].landmarks;

    // 骨架點
    for (let i = 0; i < landmarks.length; i++) {

      let x = map(
        landmarks[i][0],
        0,
        video.width,
        0,
        camW
      );

      let y = map(
        landmarks[i][1],
        0,
        video.height,
        0,
        camH
      );

      fill("#ffea00");

      noStroke();

      circle(x, y, 12);
    }

    // 手指骨架
    drawFinger(landmarks, [0,1,2,3,4], camW, camH);

    drawFinger(landmarks, [5,6,7,8], camW, camH);

    drawFinger(landmarks, [9,10,11,12], camW, camH);

    drawFinger(landmarks, [13,14,15,16], camW, camH);

    drawFinger(landmarks, [17,18,19,20], camW, camH);
  }
}

function drawFinger(landmarks, points, camW, camH) {

  stroke("#00f5d4");

  strokeWeight(5);

  for (let i = 0; i < points.length - 1; i++) {

    let p1 = landmarks[points[i]];

    let p2 = landmarks[points[i + 1]];

    let x1 = map(
      p1[0],
      0,
      video.width,
      0,
      camW
    );

    let y1 = map(
      p1[1],
      0,
      video.height,
      0,
      camH
    );

    let x2 = map(
      p2[0],
      0,
      video.width,
      0,
      camW
    );

    let y2 = map(
      p2[1],
      0,
      video.height,
      0,
      camH
    );

    line(x1, y1, x2, y2);
  }
}

function drawTexts() {

  fill("#240046");

  textSize(24);

  text(
    "414730266 留妍瑜",
    width / 2,
    50
  );

  textAlign(RIGHT);

  text(
    "WIN : " + winCount +
    "   LOSE : " + loseCount,
    width - 80,
    50
  );

  textAlign(CENTER);

  textSize(60);

  if (!gameOver) {

    if (gameState == "countdown") {

      text(countdown, width / 2, 120);
    }

    else {

      text("GO!", width / 2, 120);
    }
  }

  textSize(28);

  text(
    "玩家 : " + playerChoice +
    "      AI : " + aiChoice +
    "      " + resultText,
    width / 2,
    height - 70
  );
}

function gameLogic() {

  if (gameState == "countdown") {

    if (millis() - lastSecond > 1000) {

      countdown--;

      lastSecond = millis();
    }

    if (countdown < 0) {

      judgeGame();

      gameState = "result";

      setTimeout(resetGame, 2500);
    }
  }
}

function checkControlGesture() {

  if (predictions.length == 0) return;

  let landmarks = predictions[0].landmarks;

  let fingerCount = countFingers(landmarks);

  // ☝️ 1 = 繼續
  if (fingerCount == 1) {

    gameOver = false;

    gameState = "countdown";

    countdown = 3;

    resultText = "";
  }

  // 🤟 3 = 結束
  if (fingerCount == 3) {

    gameOver = true;
  }
}

function judgeGame() {

  if (predictions.length == 0) {

    resultText = "沒有偵測到手";

    return;
  }

  let landmarks = predictions[0].landmarks;

  let fingerCount = countFingers(landmarks);

  // 玩家
  if (fingerCount == 0) {

    playerChoice = "石頭";
  }

  else if (fingerCount == 2) {

    playerChoice = "剪刀";
  }

  else if (fingerCount == 5) {

    playerChoice = "布";
  }

  else {

    resultText = "手勢錯誤";

    return;
  }

  // AI
  let choices = ["石頭", "剪刀", "布"];

  aiChoice = random(choices);

  // 判定
  if (playerChoice == aiChoice) {

    resultText = "平手";
  }

  else if (
    (playerChoice == "石頭" && aiChoice == "剪刀") ||
    (playerChoice == "剪刀" && aiChoice == "布") ||
    (playerChoice == "布" && aiChoice == "石頭")
  ) {

    resultText = "你贏了";

    winCount++;
  }

  else {

    resultText = "你輸了";

    loseCount++;
  }
}

function countFingers(landmarks) {

  let count = 0;

  if (landmarks[8][1] < landmarks[6][1]) count++;

  if (landmarks[12][1] < landmarks[10][1]) count++;

  if (landmarks[16][1] < landmarks[14][1]) count++;

  if (landmarks[20][1] < landmarks[18][1]) count++;

  if (landmarks[4][0] < landmarks[3][0]) count++;

  return count;
}

function resetGame() {

  countdown = 3;

  lastSecond = millis();

  gameState = "countdown";
}

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);
}