/*!
 * Copyright (c) 2023 nawoo. All rights reserved.
 * Licensed under the MIT License.
 * https://opensource.org/licenses/MIT
 */
let t = 0;
let fx, fy, fz;
let is3D = false;
let r;

function setup() {
  createCanvas(800, 800, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  randomSeed(tokenId);
  random();
  fx = Math.floor(random(9));
  fy = Math.floor(random(9));
  fz = Math.floor(random(9));
  is3D = random() > 0.9;
  r = random(5, 10);
  console.log({ tokenId, fx, fy, fz, is3D, r });
}

function getPos(f, a, b, t) {
  switch (f) {
    case 0:
      return sin(a + b) * cos(a + t);
    case 1:
      return sin(a + b) * cos(b + t);
    case 2:
      return sin(a + b + t);
    case 3:
      return sin(a - b) * cos(a + t);
    case 4:
      return sin(a - b) * cos(b + t);
    case 5:
      return sin(a - b);
    case 6:
      return cos(a + t);
    case 7:
      return cos(b + t);
    default:
      return 1;
  }
}

function draw() {
  background(0);
  if (is3D) {
    ambientLight(20);
    directionalLight(0, 0, 100, 0, 0, -1);
  }
  let hue = map(sin(t), -1, 1, 0, 360);
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 30; j++) {
      let a = map(i, 0, 15, 0, PI);
      let b = map(j, 0, 30, 0, TAU);
      let x = 300 * getPos(fx, a, b, t);
      let y = 300 * getPos(fy, a, b, t);
      let z = 300 * getPos(fz, a, b, t);
      push();
      rotateY(a + t);
      translate(x, y, z);
      fill((hue + i * 15 + j) % 360, 100, 100);
      sphere(r);
      pop();
    }
  }
  t += 0.01;
}
