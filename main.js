let sky;
let highscore = 0;
let score = 0;

function createPlatform() {
    return {
        posX: random(10), posY: 0,
        w: random()
    };
}


const platforms = [];

const frog = {
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
};




function setup () {
    createCanvas(600, 600);
    frog.posX = width / 2;
    frog.posY = height / 2;
}

let startedHold = null;
function keyPressed() {
    if (key === 'w') {
        startedHold = millis();
    }
    if(key === 'a'){
        frog.facingLeft = true;
    }
    if(key === 'd'){
        frog.facingLeft = false;
    }
}

const DELTA_CAP = 500;
function getHoldDelta() {
    return abs((millis()-startedHold+DELTA_CAP)%(2*DELTA_CAP) - DELTA_CAP);
}

function keyReleased() {
    if (key === 'w') {
        frog.jump(getHoldDelta() * 0.01);
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

function draw () {
    //========== INPUT ==========//

    //========== UPDATE ==========//
    frog.update();


    calculateScore();


    //========== DISPLAY ==========//
    background(105, 202, 255);
    

    frog.display();
    // fill(255, 0, 0);
    // rect(mouseX, mouseY, 40, 40, 20);

    drawHoldBar();

    fill(255);
    noStroke();
    textSize(20);
    text("Score: " + score.toFixed(2), 20, 30);
    textSize(10);
    text("Best: " + highscore.toFixed(2), 23, 44);
}




function calculateScore(){
    // Add meters/points to the score
    score = frog.posY;
    
}
