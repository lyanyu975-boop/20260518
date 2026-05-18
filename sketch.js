let video;
let handPose;
let hands = [];

let playerChoice = "";
let aiChoice = "";
let resultText = "";

let winCount = 0;
let loseCount = 0;

let countdown = 3;
let lastTime = 0;

let gameState = "countdown";

function preload() {
  handPose = ml5.handPose();
}

function setup() {

  createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose.detectStart(video, gotHands);

  textAlign(CENTER, CENTER);

  lastTime = millis();
}

function gotHands(results) {
  hands = results;
}

function draw() {

  background("#c8b6ff");

  drawGameUI();

  drawCamera();

  drawTopText();

  drawScore();

  drawGameState();
}

function drawGameUI() {

  // 外框
  fill("#5a189a");
  noStroke();
  rect(40, 40, width - 80, height - 80, 40);

  // 遊戲機螢幕
  fill("#e0aaff");
  rect(80, 80, width - 160, height - 160, 30);

  // 裝飾按鈕
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

  drawSkeleton(camW, camH);

  pop();
}

function drawSkeleton(camW, camH) {

  for (let hand of hands) {

    let keypoints = hand.keypoints;

    // 骨架點
    for (let i = 0; i < keypoints.length; i++) {

      let x = map(keypoints[i].x, 0, video.width, 0, camW);
      let y = map(keypoints[i].y, 0, video.height, 0, camH);

      fill("#ffea00");
      noStroke();
      circle(x, y, 12);
    }

    // 手指骨架
    drawFinger(keypoints, [0,1,2,3,4], camW, camH);
    drawFinger(keypoints, [5,6,7,8], camW, camH);
    drawFinger(keypoints, [9,10,11,12], camW, camH);
    drawFinger(keypoints, [13,14,15,16], camW, camH);
    drawFinger(keypoints, [17,18,19,20], camW, camH);
  }
}

function drawFinger(keypoints, points, camW, camH) {

  stroke("#00f5d4");
  strokeWeight(5);

  for (let i = 0; i < points.length - 1; i++) {

    let p1 = keypoints[points[i]];
    let p2 = keypoints[points[i + 1]];

    let x1 = map(p1.x, 0, video.width, 0, camW);
    let y1 = map(p1.y, 0, video.height, 0, camH);

    let x2 = map(p2.x, 0, video.width, 0, camW);
    let y2 = map(p2.y, 0, video.height, 0, camH);

    line(x1, y1, x2, y2);
  }
}

function drawTopText() {

  fill("#240046");

  textSize(26);

  text(
    "414730266 留妍瑜",
    width / 2,
    55
  );
}

function drawScore() {

  fill("#240046");

  textSize(24);

  textAlign(RIGHT);

  text(
    "WIN : " + winCount + "   LOSE : " + loseCount,
    width - 100,
    55
  );

  textAlign(CENTER);
}

function drawGameState() {

  fill("#240046");

  textSize(60);

  if (gameState == "countdown") {

    text(countdown, width / 2, 120);

    if (millis() - lastTime > 1000) {

      countdown--;

      lastTime = millis();
    }

    if (countdown < 0) {

      gameState = "result";

      judgeGame();
    }
  }

  else if (gameState == "result") {

    text("GO!", width / 2, 120);

    fill("#3c096c");

    textSize(28);

    text(
      "玩家 : " + playerChoice +
      "      AI : " + aiChoice +
      "      " + resultText,
      width / 2,
      height - 70
    );

    setTimeout(resetGame, 2500);

    gameState = "waiting";
  }
}

function judgeGame() {

  if (hands.length == 0) {

    resultText = "沒有偵測到手";

    return;
  }

  let keypoints = hands[0].keypoints;

  let fingerCount = countFingers(keypoints);

  // 玩家判定
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

  // AI隨機
  let choices = ["石頭", "剪刀", "布"];

  aiChoice = random(choices);

  // 勝負判定
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

function countFingers(keypoints) {

  let count = 0;

  // 食指
  if (keypoints[8].y < keypoints[6].y) count++;

  // 中指
  if (keypoints[12].y < keypoints[10].y) count++;

  // 無名指
  if (keypoints[16].y < keypoints[14].y) count++;

  // 小指
  if (keypoints[20].y < keypoints[18].y) count++;

  // 拇指
  if (keypoints[4].x < keypoints[3].x) count++;

  return count;
}

function resetGame() {

  countdown = 3;

  lastTime = millis();

  gameState = "countdown";
}

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);
}
