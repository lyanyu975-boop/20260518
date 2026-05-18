let handPose;
let video;
let hands = [];
let pg; // 用於處理像素特效的圖層
let vw, vh; // 攝影機顯示的寬高
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

  // 建立與視訊畫面同尺寸的 Graphics
  pg = createGraphics(vw, vh);

  // 開始偵測手勢
  handPose.detectStart(video, gotHands);
  
  textAlign(CENTER, CENTER);
}

function draw() {
  background('#e7c6ff');

  // 計算攝影機置中的位置
  let x = (width - vw) / 2;
  let y = (height - vh) / 2;

  // 1. 繪製攝影機影像 (修正鏡像問題)
  push();
  translate(x + vw, y); // 移動到顯示區域右側
  scale(-1, 1);        // 水平翻轉
  image(video, 0, 0, vw, vh);
  pop();

  // 2. 更新與繪製 Graphics (像素數值層)
  drawPixelEffect();
  image(pg, x, y); // 將處理後的圖層疊在視訊上方

  // 3. 繪製手勢骨架
  drawSkeleton(x, y);

  // 4. 顯示遊戲狀態
  fill(0);
  textSize(32);
  text("狀態: " + gameState, width / 2, 50);
  textSize(16);
  text("按 '1' 繼續 | 按 '3' 結束", width / 2, height - 30);
}

function gotHands(results) {
  hands = results;
}

function drawPixelEffect() {
  pg.clear();
  pg.background(255, 100); // 稍微透明的基底
  
  // 取得 video 的像素資料以進行計算
  video.loadPixels();
  
  let stepSize = 20;
  
  if (video.pixels.length > 0) {
    // 因為要對應到翻轉後的畫面，採樣邏輯需注意
    for (let py = 0; py < video.height; py += stepSize) {
      for (let px = 0; px < video.width; px += stepSize) {
        let index = (px + py * video.width) * 4;
        let r = video.pixels[index];
        let g = video.pixels[index + 1];
        let b = video.pixels[index + 2];
        let avg = floor((r + g + b) / 3);

        // 對應到全螢幕畫面的座標 (包含鏡像處理)
        let displayX = map(video.width - px, 0, video.width, 0, vw);
        let displayY = map(py, 0, video.height, 0, vh);

        pg.fill(0);
        pg.textSize(8);
        pg.textAlign(CENTER, CENTER);
        pg.text(avg, displayX, displayY);
      }
    }
  }
}

function drawSkeleton(offX, offY) {
  stroke(0, 255, 0);
  strokeWeight(3);

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    
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

        // 座標轉換：需考量比例與鏡像
        let x1 = map(video.width - p1.x, 0, video.width, offX, offX + vw);
        let y1 = map(p1.y, 0, video.height, offY, offY + vh);
        let x2 = map(video.width - p2.x, 0, video.width, offX, offX + vw);
        let y2 = map(p2.y, 0, video.height, offY, offY + vh);

        line(x1, y1, x2, y2);
      }
    });
  }
}

// 遊戲邏輯控制
function keyPressed() {
  if (key === '1') {
    gameState = "進行中 (繼續)";
    console.log("遊戲繼續");
  } else if (key === '3') {
    gameState = "遊戲結束";
    console.log("遊戲結束");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  vw = width * 0.6;
  vh = height * 0.6;
  pg = createGraphics(vw, vh);
}

