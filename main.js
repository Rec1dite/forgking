const SCREEN_H = 600, SCREEN_W = 600;
let sky;
let highscore = 0;
let score = 0;
let forg = createFrog();
let startTime = 0;

let camY = 0;
const CAM_TARGET = SCREEN_H/6;
const CAM_EASE = 0.01;

const SPAWN_TIME = 5000; // 30 seconds in miliseconds
const SHARK_SPEED = 0;
const HOLD_DELTA_CAP = 500;

const debugGraphics = {};

const PLATFORM_HEIGHT = 70;
const platforms = [];
const shark = createShark();

function createPlatform(y) {
    const randW = random(30, 100);
    const randX = random(randW, width-randW)

    return {
        posX: randX, posY: y,
        w: randW,

        display() {
            rectMode(CENTER);
            noStroke();
            fill(50, 100, 50);
            rect(this.posX, height - this.posY, this.w, PLATFORM_HEIGHT);
        }
    };
}

function createShark() {
    return {
        posX: 0, posY: 0,
        velX: SHARK_SPEED, velY: SHARK_SPEED,
        drag: 0.99,
        facingLeft: false,
        
        
        w: 40, h: 40,
        img: null,
        
        jump(multiplier = 1) {
            this.velY += this.yJumpForce * multiplier;
            this.velX += this.xJumpForce * (this.facingLeft ? -1 : 1) * multiplier;
        },
    
        update () {
            this.velX *= this.drag;
            this.velX *= this.drag;
        
            this.posX += this.velX;
            this.posY += this.velY;
        },
    
        display() {
            rectMode(CENTER);
            stroke(0, 50, 0);
            fill(50, 110, 200);
            rect(this.posX, height - this.posY - this.h/2, this.w, this.h);
            fill(255);
            rect(this.posX + this.w*(this.facingLeft ? -1 : 1)/10, height - this.posY - this.h/2, this.w/5, this.h/5);
            rect(this.posY + 2*this.w*(this.facingLeft ? -1 : 1)/5, height - this.posY - this.h/2, this.w/5, this.h/5);
        },

        spawn(){
            
        },
    }     

}

            

function createFrog() {
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

            // Ground collision
            if (this.posY < 0) {
                this.posY = 0;
                this.velY = 0;
                this.velX = 0;
            }
            // Wall collision
            if (this.posX < this.w/2) {
                this.posX = this.w/2;
                this.velX *= -1;
            }
            if (this.posX > width-this.w/2) {
                this.posX = width-this.w/2;
                this.velX *= -1;
            }
            // Platform collision
            debugGraphics["feet"] = () => {
                stroke(255, 0, 0);
                const h = height - this.posY;
                line(0, h, width, h);
                const v = this.posX+this.w/2;
                line(v, 0, v, height);
            }

            for (let plat of platforms) {
                const platSurface = plat.posY + PLATFORM_HEIGHT/2;
                const forgL = this.posX - this.w/2;
                const forgR = this.posX + this.w/2;
                debugGraphics[`plat-${round(plat.posY)}`] = () => {
                    stroke(0, 255, 255);
                    const h = platSurface;
                    line(0, h, width, h);
                };

                if (
                    this.posY < platSurface &&
                    this.posY > platSurface - PLATFORM_HEIGHT &&
                    this.velY <= 0
                ) {

                    if (forgR > plat.posX - plat.w/2 && forgL < plat.posX + plat.w/2) {
                        this.posY = plat.posY + PLATFORM_HEIGHT/2;
                        this.velY = 0;
                        this.velX *= 0.1;
                    }
                }
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
    shark.posX = random(1)? 0 : width;
    shark.posY = random(1)? 0 : height;
    startTime = millis();
    camY = -CAM_TARGET;

    platforms.push(createPlatform(100));
    platforms.push(createPlatform(100));
    platforms.push(createPlatform(300));
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
    return abs((millis()-startedHold+HOLD_DELTA_CAP)%(2*HOLD_DELTA_CAP) - HOLD_DELTA_CAP);
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
        rect(width/2, height - 10, max(20, width * (getHoldDelta()/HOLD_DELTA_CAP)), 4);
    }
}

function drawGround() {
    rectMode(CORNER);
    noStroke();
    fill(20);
    rect(0, height, width, 100);
    fill(255);
}

function drawDebugGraphics() {
    for (let key in debugGraphics) {
        if (key !== null) {
            debugGraphics[key]();
        }
    }
}

function draw () {
    let elapsedTime = millis() - startTime;

    //========== INPUT ==========//

    //========== UPDATE ==========//
    forg.update();
    shark.update();
    if (abs(forg.velY) < 0.05) {
        const camDelta = camY - forg.posY + CAM_TARGET;
        camY -= camDelta * CAM_EASE;
    }


    calculateScore();




    //========== DISPLAY ==========//
    background(105, 202, 255);
    // fill(105, 202, 255, 50);
    // rectMode(CORNERS);
    // rect(0, 0, width, height);
    
    // Draw entities
    push();
    translate(0, camY);

    drawGround();



    for (let plat of platforms) {
        plat.display();
    }

    forg.display();

    if (elapsedTime > SPAWN_TIME){
        shark.spawn();
        startTime = millis();
    }
    // fill(255, 0, 0);
    // rect(mouseX, mouseY, 40, 40, 20);

    drawDebugGraphics();

    pop();

    drawHoldBar();

    fill(255);
    noStroke();
    textSize(20);
    text("Score: " + score.toFixed(2), 20, 30);
    textSize(10);

    text("Best: " + highscore.toFixed(2), 23, 44);
    textSize(15);
    text("Time: " + (elapsedTime*0.001).toFixed(3), 450, 20);

}

function calculateScore(){
    // Add meters/points to the score
    score = forg.posY/100;

    if (score > highscore) {
        const prevHighscore = highscore;
        highscore = score;
        
        if (floor(200*prevHighscore) < floor(200*highscore)) {
            platforms.push(createPlatform(floor(200*highscore)+200));
        }
    }
}
