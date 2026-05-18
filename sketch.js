let handPose;
let video;
let hands = [];
let vw, vh; // 攝影機顯示的寬高
let isModelStarted = false;
let gameState = "等待手勢"; // 狀態: "等待手勢", "1", "3"
let winCount = 0;
let lossCount = 0;
let gameResult = ""; // 顯示 "你贏了", "你輸了" 或 "平手"
let lastPlayTime = 0; // 用於控制出拳冷卻時間
let playCooldown = 1500; // 1.5秒冷卻，防止連續判定
let compHand = ""; // 電腦出的拳
function preload() {
  // 載入 handPose 模型
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 設定攝影機
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // 計算顯示尺寸 (全螢幕的 60%)
  vw = width * 0.6;
  vh = height * 0.6;

  textAlign(CENTER, CENTER);
}

function draw() {
  background('#e7c6ff');

  // 計算攝影機置中的位置
  let x = (width - vw) / 2;
  let y = (height - vh) / 2;

  // 確認攝影機已載入且模型尚未開始偵測
  if (video.width > 0 && !isModelStarted) {
    handPose.detectStart(video, gotHands);
    isModelStarted = true;
  }

  // 1. 繪製攝影機影像 (修正鏡像問題)
  push();
  translate(x + vw, y); // 移動到顯示區域右側
  scale(-1, 1);        // 水平翻轉
  image(video, 0, 0, vw, vh);
  pop();

  // 3. 繪製手勢骨架
  if (hands.length > 0) {
    drawSkeleton(x, y);
  }

  // 4. 顯示遊戲狀態
  fill(0);
  textSize(32);
  text("狀態: " + gameState, width / 2, 50);
  textSize(20);
  text("比 1: 繼續遊戲 | 比 3: 結束遊戲", width / 2, height - 30);

  // 5. 顯示右上角計分板
  fill(0);
  textAlign(RIGHT, TOP);
  textSize(24);
  text(`贏: ${winCount} | 輸: ${lossCount}`, width - 20, 20);
  
  // 6. 顯示猜拳結果
  if (gameResult !== "") {
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    textSize(48);
    text(gameResult, width / 2, height / 2 + vh / 2 + 40);
    textSize(24);
    text(`電腦出: ${compHand}`, width / 2, height / 2 + vh / 2 + 80);
  }
}

function gotHands(results) {
  hands = results;
}

function drawSkeleton(offX, offY) {
  stroke(0, 255, 0);
  strokeWeight(3);

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let fingersUp = countFingers(hand);

    // 根據手指數判斷狀態： 1 -> 繼續, 3 -> 結束
    if (fingersUp === 1) {
      gameState = "1";
      gameResult = ""; // 清除結果畫面準備下一局
    } else if (fingersUp === 3) {
      gameState = "3";
      gameResult = "遊戲已結束";
    }

    // 猜拳邏輯: 只有在狀態 1 (繼續) 且不在冷卻時間時觸發
    if (gameState === "1" && (millis() - lastPlayTime > playCooldown)) {
      if (fingersUp === 0 || fingersUp === 2 || fingersUp === 5) {
        judgeRPS(fingersUp);
        lastPlayTime = millis();
      }
    }

    // 定義骨架連接點段落
    let fingerLines = [
      [0, 1, 2, 3, 4],    // 大拇指
      [5, 6, 7, 8],       // 食指
      [9, 10, 11, 12],    // 中指
      [13, 14, 15, 16],   // 無名指
      [17, 18, 19, 20]    // 小拇指
    ];

    fingerLines.forEach(points => {
      for (let j = 0; j < points.length - 1; j++) {
        let p1 = hand.keypoints[points[j]];
        let p2 = hand.keypoints[points[j+1]];
        let x1 = map(p1.x, 0, video.width, offX + vw, offX);
        let y1 = map(p1.y, 0, video.height, offY, offY + vh);
        let x2 = map(p2.x, 0, video.width, offX + vw, offX);
        let y2 = map(p2.y, 0, video.height, offY, offY + vh);
        line(x1, y1, x2, y2);
      }
    });
  }
}

function countFingers(hand) {
  let count = 0;
  let tips = [8, 12, 16, 20]; // 食指、中指、無名指、小指
  let joints = [6, 10, 14, 18];
  for (let k = 0; k < tips.length; k++) {
    if (hand.keypoints[tips[k]].y < hand.keypoints[joints[k]].y) count++;
  }
  // 大拇指判斷 (考慮左右手水平距離)
  if (abs(hand.keypoints[4].x - hand.keypoints[2].x) > 40) count++;
  return count;
}

function judgeRPS(userFingers) {
  let choices = [0, 2, 5]; // 石頭, 剪刀, 布
  let names = {0: "石頭", 2: "剪刀", 5: "布"};
  let computerIdx = floor(random(3));
  let computerMove = choices[computerIdx];
  compHand = names[computerMove];

  if (userFingers === computerMove) {
    gameResult = "平手！";
  } else if (
    (userFingers === 0 && computerMove === 2) || // 石頭贏剪刀
    (userFingers === 2 && computerMove === 5) || // 剪刀贏布
    (userFingers === 5 && computerMove === 0)    // 布贏石頭
  ) {
    gameResult = "你贏了！";
    winCount++;
  } else {
    gameResult = "你輸了！";
    lossCount++;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  vw = width * 0.6;
  vh = height * 0.6;
}
