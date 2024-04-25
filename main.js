const SCREEN_H = 600, SCREEN_W = 600;
let sky;
let highscore = 0;
let score = 0;
let forg = createEntity();
let startTime = 0;

let camY = 0;
const CAM_TARGET = SCREEN_H/6;
const CAM_EASE = 0.01;


const SPAWN_TIME = 500; // 30 seconds in miliseconds

const DELTA_CAP = 500;


const platforms = [];
const shark = createEntity();



function createPlatform() {
    return {
        posX: random(10), posY: 0,
        w: random()
    };
}

function createEntity() {
    return  {
        posX: 0, posY: 0,
        velX: 0, velY: 0,
        grav: -0.5,
        drag: 0.999,
        xJumpForce: 1,
        yJumpForce: 4,
        facingLeft: false,


        w: 40, h: 40,
        img: null,

        jump(multiplier = 1) {
            this.velY += this.yJumpForce * multiplier;
            this.velX += this.xJumpForce * (this.facingLeft ? -1 : 1) * multiplier;
        },

        update () {
            this.velY += this.grav;

            this.velX *= this.drag;
            this.velX *= this.drag;

            this.posX += this.velX;
            this.posY += this.velY;

            if (this.posY < 0) {
                this.posY = 0;
                this.velY = 0;
                this.velX = 0;
            }
            if (this.posX < this.w/2) {
                this.posX = this.w/2;
                this.velX *= -1;
            }
            if (this.posX > width-this.w/2) {
                this.posX = width-this.w/2;
                this.velX *= -1;
            }
        },

        display() {
            rectMode(CENTER);
            stroke(0, 50, 0);
            fill(100, 255, 100);
            rect(this.posX, height - this.posY - this.h/2, this.w, this.h);
            fill(255);
            rect(this.posX + this.w*(this.facingLeft ? -1 : 1)/10, height - this.posY - this.h/2, this.w/5, this.h/5);
            rect(this.posX + 2*this.w*(this.facingLeft ? -1 : 1)/5, height - this.posY - this.h/2, this.w/5, this.h/5);
        }
    }
}




function setup () {
    createCanvas(SCREEN_W, SCREEN_H);
    forg.posX = width / 2;
    forg.posY = height / 2;
    shark.posX = random(0, width);
    shark.posY = random(0, height);
    startTime = millis();
    camY = -CAM_TARGET;
}

let startedHold = null;
function keyPressed() {
    if (key === 'w') {
        startedHold = millis();
    }
    if(key === 'a'){
        forg.facingLeft = true;
    }
    if(key === 'd'){
        forg.facingLeft = false;
    }
}

function getHoldDelta() {
    return abs((millis()-startedHold+DELTA_CAP)%(2*DELTA_CAP) - DELTA_CAP);
}

function keyReleased() {
    if (key === 'w') {
        forg.jump(getHoldDelta() * 0.01);
        startedHold = null;        
    }
}

function drawHoldBar() {
    if (startedHold !== null) {
        rectMode(CENTER);
        fill(230, 50, 50);
        stroke(0);
        strokeWeight(2);
        // const delta = (millis() - startedHold) % DELTA_CAP;
        rect(width/2, height - 10, max(20, width * (getHoldDelta()/DELTA_CAP)), 4);
    }
}

function drawGround() {
    rectMode(CORNER);
    fill(0);
    rect(0, height, width, 100);
    fill(255);
}

function draw () {
    let elapsedTime = millis() - startTime;

    //========== INPUT ==========//

    //========== UPDATE ==========//
    forg.update();
    if (abs(forg.velY) < 0.1) {
        const camDelta = camY - forg.posY + CAM_TARGET;
        camY -= camDelta * CAM_EASE;
    }


    calculateScore();
    if (elapsedTime > SPAWN_TIME){
        shark.display();
    }


    //========== DISPLAY ==========//
    background(105, 202, 255);
    
    // Draw entities
    push();
    translate(0, camY);
    // rotate(radians(0));
    drawGround();

    forg.display();
    // fill(255, 0, 0);
    // rect(mouseX, mouseY, 40, 40, 20);

    pop();

    drawHoldBar();

    fill(255);
    noStroke();
    textSize(20);
    text("Score: " + score.toFixed(2), 20, 30);
    textSize(10);

    text("Best: " + highscore.toFixed(2), 23, 44);
    textSize(15);
    text("Time: " + elapsedTime*0.001, 450, 20);
}

function calculateScore(){
    // Add meters/points to the score
    score = forg.posY/100;
    highscore = max(score, highscore);
}
