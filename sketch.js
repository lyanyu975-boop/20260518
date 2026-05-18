function drawHand(camW, camH) {

  if (predictions.length > 0) {

    let landmarks = predictions[0].landmarks;

    // =========================
    // 畫骨架點
    // =========================
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

    // =========================
    // 手掌主幹
    // =========================
    drawLine(landmarks, 0, 5, camW, camH);
    drawLine(landmarks, 5, 9, camW, camH);
    drawLine(landmarks, 9, 13, camW, camH);
    drawLine(landmarks, 13, 17, camW, camH);

    // =========================
    // 五根手指
    // =========================
    drawFinger(landmarks, [0,1,2,3,4], camW, camH);

    drawFinger(landmarks, [5,6,7,8], camW, camH);

    drawFinger(landmarks, [9,10,11,12], camW, camH);

    drawFinger(landmarks, [13,14,15,16], camW, camH);

    drawFinger(landmarks, [17,18,19,20], camW, camH);
  }
}