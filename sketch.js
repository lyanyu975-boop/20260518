let handPose;
let video;
let hands = [];
let vw, vh; // 攝影機顯示的寬高
let isModelStarted = false;
let gameState = "準備中";

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

  // 2. 取得像素亮度並顯示 (直接在主畫布繪製，不使用 createGraphics)
  if (isModelStarted) {
    drawPixelValues(x, y);
  }

  // 3. 繪製手勢骨架
  if (hands.length > 0) {
    drawSkeleton(x, y);
  }

  // 4. 顯示遊戲狀態
  fill(0);
  textSize(32);
  text("狀態: " + gameState, width / 2, 50);
  textSize(20);
  text("手勢 1: 繼續 | 手勢 3: 結束", width / 2, height - 30);
}

function gotHands(results) {
  hands = results;
}

function drawPixelValues(offX, offY) {
  // 取得 video 的像素資料以進行計算
  video.loadPixels();
  let stepSize = 20;

  if (video.pixels.length > 0) {
    fill(0);
    textSize(8);
    noStroke();
    for (let py = 0; py < video.height; py += stepSize) {
      for (let px = 0; px < video.width; px += stepSize) {
        let index = (px + py * video.width) * 4;
        let r = video.pixels[index];
        let g = video.pixels[index + 1];
        let b = video.pixels[index + 2];
        // 計算 (pixel[0] + pixel[1] + pixel[2])/3
        let avg = floor((r + g + b) / 3);

        // 座標轉換：需包含鏡像處理
        let dx = map(px, 0, video.width, offX + vw, offX);
        let dy = map(py, 0, video.height, offY, offY + vh);

        text(avg, dx, dy);
      }
    }
  }
}

function drawSkeleton(offX, offY) {
  stroke(0, 255, 0);
  strokeWeight(3);

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    // 辨識手勢邏輯 (偵測手指是否伸直)
    let fingersUp = 0;
    let tips = [8, 12, 16, 20]; // 食指、中指、無名指、小指
    let joints = [6, 10, 14, 18];
    for (let k = 0; k < tips.length; k++) {
      if (hand.keypoints[tips[k]].y < hand.keypoints[joints[k]].y) fingersUp++;
    }
    // 大拇指判斷
    if (abs(hand.keypoints[4].x - hand.keypoints[2].x) > 25) fingersUp++;

    // 根據手指數判斷狀態： 1 -> 繼續, 3 -> 結束
    if (fingersUp === 1) {
      gameState = "1";
    } else if (fingersUp === 3) {
      gameState = "3";
    }

    // 猜拳顯示邏輯 (RPS)
    let rps = "";
    if (fingersUp === 0) rps = "石頭";
    else if (fingersUp === 2) rps = "剪刀";
    else if (fingersUp === 5) rps = "布";
    
    if (rps !== "") {
      push();
      fill(255, 0, 0);
      textSize(64);
      text(rps, width / 2, height / 2);
      pop();
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  vw = width * 0.6;
  vh = height * 0.6;
  pg = createGraphics(vw, vh);
}
