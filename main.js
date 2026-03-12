// variable declarations
let gameOver = false;
let rocket;
let rocketImg;
let score = 0;
let mic;
let volume = 0;
let micStarted = false;

let groundHeight = 150;
let groundColor;
let groundY;
let angle = 0;
let velocityX = 0;
let velocityY = 0;

////////////////////////////////////////////////

// load rocket image
function preload() {
  rocketImg = loadImage("rocket.png");
}

function setup() {
  createCanvas(400, 700);
  groundY = height - groundHeight;
  groundColor = color(34, 139, 34); 
  rocket = new Rocket(width / 2, groundY - 25);
  
  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  // get volume
  volume = mic.getLevel();
  
  // background
  let altitude = groundY - rocket.y;
  let skyColor = lerpColor(
  color(150, 250, 250),
  color(0, 0, 30),
  constrain(altitude / 1000, 0, 1)
  );
  background(skyColor);
  
  // fuel bar display 
  fill(255, 200, 0);
  rect(10, 50, map(rocket.fuel, 0, rocket.maxFuel, 0, 200), 20);
  noFill();
  stroke(0);
  rect(10, 50, 200, 20);
  noStroke();
  
  // camera follows rocket
  let camY = 0;
  if (rocket.y < height / 2) {
  camY = rocket.y - height / 2; 
  }
  push();
  translate(0, -camY);
  
  // ground scrolling
  fill(groundColor);
  noStroke();
  rect(0, groundY, width, 1000);

  rocket.thrusting = false;
  
  // controls
  if (!gameOver) {
    let volumeThreshold = 0.01;
    if (!gameOver && volume > volumeThreshold) {
      rocket.applyThrust(volume * 3);
    }
    if (keyIsDown(LEFT_ARROW)) rocket.rotate(-1);
    if (keyIsDown(RIGHT_ARROW)) rocket.rotate(1);
    if (keyIsDown(UP_ARROW)) rocket.applyThrust();
  }

  // update and show the rocket
  rocket.update();
  rocket.show();
  
  //restores camera
  pop();
  
  // count altitude
  score = max(score, floor(altitude));
  
  // game over text 
  if (gameOver) {
    fill(0);
    textAlign(CENTER);
    textSize(40);
    text("GAME OVER", width / 2, height / 2);
    
    // score text
    textSize(24);
    text("Score: " + floor(score), width / 2, height /2 + 50);
  }
}

// functions 
function mousePressed() {
  if (!micStarted) {
    mic.start();
    micStarted = true;
    console.log("Microphone started!");
  }
}

// objects
class Rocket {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.thrustStrength = 1;
    this.gravity = 0.2;
    this.crashed = false;
    this.launched = false;
    this.exploded = false;
    this.explosionSize = 0;
    this.thrusting = false;
    
    this.fuel = 100;
    this.maxFuel = 100;
    this.fuelConsumption = 0.5;
  }
  // rocket rotation / vector's direction
  rotate(dir) {
    this.angle += dir * 0.05;
  }
  //accelerates in the direction of the vector
  applyThrust(amount = 1) {
    if (this.fuel <= 0) return; // no fuel no thrust
    
    this.thrusting = true;
    this.launched = true;
    
    let correctedAngle = this.angle - PI / 2;
    this.velocityX += cos(correctedAngle) * this.thrustStrength * amount;
    this.velocityY += sin(correctedAngle) * this.thrustStrength * amount;
    
    this.fuel -=this.fuelConsumption * amount; 
    this.fuel = max(this.fuel, 0); //prevents negative fuel
  }
  // move rocket according to velocity
  update() {
    // apply velocity
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // applies drag
    this.velocityX *= 0.99;
    this.velocityY *= 0.99;
    
    // apply gravitational pull
    if (this.y < groundY - 25) {this.velocityY += this.gravity;}
  
    // prevents rocket from leaving canvas
    this.x = constrain(this.x, 0, width);
    this.y = min(this.y, 5000);
    
    // ground collision
    if (this.y >= groundY - 25) {

    // store landing speed BEFORE resetting
    let landingSpeed = this.velocityY;

    this.y = groundY - 25;
    this.velocityY = 0;
    
  
  // fuel refill
  if (this.launched && !this.crashed) {
    if (landingSpeed >= 4) {
      this.exploded = true;
      gameOver = true;
    } else {
      console.log("Landed safely!");
      this.fuel = this.maxFuel; // refill fuel
    }
    this.crashed = true;
  }
  
      
    // crash condition
    if (this.launched && !this.crashed) {
      if (landingSpeed >= 4) {
        this.exploded = true;
        gameOver = true;
      } else {
        console.log("Landed safely!");
      }

      this.crashed = true;
    }
  }
}
  
  show() {
    // explosion animation
    if (this.exploded) {
      fill(255, 150, 0);
      noStroke();
      circle(this.x, this.y, this.explosionSize);
      
      fill(255,140,0);
      circle(this.x, this.y, this.explosionSize * 0.7);
      
      fill(255,60,0);
      circle(this.x, this.y, this.explosionSize * 0.7);
      
      this.explosionSize += 20; 
      return;
    }
    
    // miscellaneous
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
   // thrust flames
    if (this.thrusting && !this.exploded) {
      fill(255, 150, 0);
      noStroke();
      
      triangle(-8, 25, 8, 25, 0, 25 + random(20, 35)); 
      
      fill(255,200,0);
      triangle(-5,25, 5,25, 0,25 + random(10,20));
    }
    // rocket image
    imageMode(CENTER);
    image(rocketImg, 0, 0, 50, 50);
    pop();
  }
}
