let video;
let handPose;
let hands = [];

let playerChoice = "";
let aiChoice = "";
let result = "";

let winCount = 0;
let loseCount = 0;

let gameActive = true;

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
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background("#e7c6ff");

  // 攝影機畫面大小
  let camW = width * 0.6;
  let camH = height * 0.6;

  let camX = width / 2 - camW / 2;
  let camY = height / 2 - camH / 2;

  // 修正鏡像問題
  push();
  translate(camX + camW, camY);
  scale(-1, 1);

  image(video, 0, 0, camW, camH);

  drawHandSkeleton(camW, camH);

  pop();

  // 上方學號姓名
  fill(0);
  textSize(24);
  text("414730266 留妍瑜", width / 2, 40);

  // 右上角分數
  textAlign(RIGHT);
  textSize(24);
  text("贏：" + winCount + "  輸：" + loseCount, width - 30, 40);

  // 中下方顯示結果
  textAlign(CENTER);

  textSize(32);
  fill(50);

  text("玩家：" + playerChoice, width / 2, height - 140);
  text("AI：" + aiChoice, width / 2, height - 100);
  text(result, width / 2, height - 60);

  if (!gameActive) {
    fill(255, 0, 0);
    textSize(50);
    text("遊戲結束", width / 2, height / 2);
  }
}

function drawHandSkeleton(camW, camH) {

  for (let hand of hands) {

    let keypoints = hand.keypoints;

    stroke(0);
    strokeWeight(4);

    // 每根手指連線
    drawFinger(keypoints, 0, 4, camW, camH);
    drawFinger(keypoints, 5, 8, camW, camH);
    drawFinger(keypoints, 9, 12, camW, camH);
    drawFinger(keypoints, 13, 16, camW, camH);
    drawFinger(keypoints, 17, 20, camW, camH);

    // 判斷手勢
    let fingerCount = countFingers(keypoints);

    if (fingerCount == 1) {
      gameActive = true;
    }

    if (fingerCount == 3) {
      gameActive = false;
    }

    if (gameActive) {

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
        return;
      }

      aiChoice = random(["石頭", "剪刀", "布"]);

      judgeGame();
    }
  }
}

function drawFinger(keypoints, start, end, camW, camH) {

  for (let i = start; i < end; i++) {

    let x1 = map(keypoints[i].x, 0, video.width, 0, camW);
    let y1 = map(keypoints[i].y, 0, video.height, 0, camH);

    let x2 = map(keypoints[i + 1].x, 0, video.width, 0, camW);
    let y2 = map(keypoints[i + 1].y, 0, video.height, 0, camH);

    line(x1, y1, x2, y2);
  }
}

function countFingers(keypoints) {

  let count = 0;

  // 拇指
  if (keypoints[4].x < keypoints[3].x) {
    count++;
  }

  // 食指
  if (keypoints[8].y < keypoints[6].y) {
    count++;
  }

  // 中指
  if (keypoints[12].y < keypoints[10].y) {
    count++;
  }

  // 無名指
  if (keypoints[16].y < keypoints[14].y) {
    count++;
  }

  // 小指
  if (keypoints[20].y < keypoints[18].y) {
    count++;
  }

  return count;
}

function judgeGame() {

  if (playerChoice == aiChoice) {
    result = "平手";
    return;
  }

  if (
    (playerChoice == "石頭" && aiChoice == "剪刀") ||
    (playerChoice == "剪刀" && aiChoice == "布") ||
    (playerChoice == "布" && aiChoice == "石頭")
  ) {
    result = "你贏了！";
    winCount++;
  }
  else {
    result = "你輸了！";
    loseCount++;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
