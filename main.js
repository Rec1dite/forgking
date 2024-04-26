const SCREEN_H = 600, SCREEN_W = 600;
let sky;
let highscore = 0;
let score = 0;
let forg = createFrog();
let startTime = 0;
let lives = 3
let dead = false;

const PLATFORM_SPACING = 300;
let highestPlatform = 3*PLATFORM_SPACING;

let camY = 0;
const CAM_TARGET = SCREEN_H/6;
const CAM_EASE = 0.01;

const ROUNDING = 4;

const SPAWN_TIME = 5000; // 5 seconds in miliseconds
const SHARK_LAUNCH_FORCE = 10;
const HOLD_DELTA_CAP = 500;

const debugGraphics = {};

const clouds = [];

const PLATFORM_HEIGHT = 70;
const platforms = [];
const shark = createShark();

function createCloud() {
    return {
        delay: random(0, width/2),
        size: random(40, 80)
    }
}

function createPlatform(y) {
    let randW = random(100, 400);
    // let randW = 40;
    let randX = random(randW, width-randW)

    return {
        posX: randX, posY: y,
        w: randW,

        display() {
            rectMode(CENTER);
            noStroke();
            fill(50, 100, 50, 50);
            rect(this.posX, height - this.posY, randW, PLATFORM_HEIGHT, ROUNDING);
        }
    };
}

function createShark() {
    return {
        posX: 0, posY: 0,
        velX: 0, velY: 0,
        drag: 0.99,
        grav: -0.2,
        facingLeft: false,
        
        
        w: 40, h: 40,
        img: null,
        
    
        update () {
            this.velY += this.grav;

            this.velX *= this.drag;
            this.velX *= this.drag;

            this.posX += this.velX;
            this.posY += this.velY;

            //Check for collision with frog
            const xTouch = this.posX > forg.posX - forg.w/2 && this.posX < forg.posX + forg.w/2;
            const yTouch = this.posY > forg.posY - forg.h/2 && this.posY < forg.posY + forg.h/2;
            if(xTouch && yTouch){
                console.log("Shark ate frog!!!");
                lives--;

                if(lives <= 0){
                    dead = true;
                }
            }
        },
    
        display() {
            rectMode(CENTER);
            stroke(0, 50, 0);
            fill(50, 110, 200);
            rect(this.posX, height - this.posY - this.h/2, this.w*1.4, this.h, ROUNDING);
            const dir = this.facingLeft ? -1 : 1;

            triangle(
                this.posX,
                height - this.posY - this.h,
                this.posX - dir*this.w/3,
                height - this.posY - this.h,
                this.posX - dir*1.2*this.w/3,
                height - this.posY - 1.4*this.h,
            );

            fill(255, 150, 150);
            const eyeW = this.w/5;
            const eyeH = 3*this.h/5;
            const eyeSpacing = 3*this.w/10;
            triangle(
                this.posX,
                height - this.posY - eyeH,
                this.posX + dir*eyeW,
                height - this.posY + eyeW - eyeH,
                this.posX,
                height - this.posY + eyeW - eyeH,
            );
            triangle(
                this.posX + dir*(eyeW + eyeSpacing),
                height - this.posY - eyeH,
                this.posX + dir*eyeSpacing,
                height - this.posY + eyeW - eyeH,
                this.posX + dir*(eyeW + eyeSpacing),
                height - this.posY + eyeW - eyeH,
            );
        },

        spawn(){
            const spawnLeft = random(0, 1) < 0.5;

            this.posX = spawnLeft ? 0 : width;
            this.posY = camY;

            this.velX = (spawnLeft ? 1 : -1) * SHARK_LAUNCH_FORCE;
            this.velY = SHARK_LAUNCH_FORCE*4;

            this.facingLeft = !spawnLeft;

            this.posY < height/2 + camY? this.velY = SHARK_LAUNCH_FORCE : this.velY = -SHARK_LAUNCH_FORCE;
        }     
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
            // debugGraphics["feet"] = () => {
            //     stroke(255, 0, 0);
            //     const h = height - this.posY;
            //     line(0, h, width, h);
            //     const v = this.posX+this.w/2;
            //     line(v, 0, v, height);
            // }

            for (let plat of platforms) {
                const platSurface = plat.posY + PLATFORM_HEIGHT/2;
                const forgL = this.posX - this.w/2;
                const forgR = this.posX + this.w/2;
                // debugGraphics[`plat-${round(plat.posY)}`] = () => {
                //     stroke(0, 255, 255);
                //     const h = platSurface;
                //     line(0, h, width, h);
                // };

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

            // Body
            fill(100, 255, 100);
            rect(this.posX, height - this.posY - this.h/2, this.w, this.h, ROUNDING);

            // Legs
            // rect(this.posX + this.w*0.55, height - this.posY, this.w/5, this.h/5);
            // rect(this.posX + this.w*0.15, height - this.posY, this.w/5, this.h/5);
            // rect(this.posX - this.w*0.35, height - this.posY - this.h*0.1, this.w/2, this.h/2);

            // Eyes
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

    platforms.push(createPlatform(PLATFORM_SPACING));
    platforms.push(createPlatform(2*PLATFORM_SPACING));
    platforms.push(createPlatform(3*PLATFORM_SPACING));

    for (let c = 0; c < 3; c++) {
        clouds.push(createCloud())
    }
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
    // Forg is in the air, and forg is not off the screen
    // if (abs(forg.velY) < 0.05) {
        const camDelta = camY - forg.posY + CAM_TARGET;
        camY -= camDelta * CAM_EASE * (camDelta > 0 ? 3 : 1);
    // }


    calculateScore();

    // Update platforms
    if (forg.posY > highestPlatform - 2*PLATFORM_SPACING) {
        highestPlatform += PLATFORM_SPACING;
        platforms.push(createPlatform(highestPlatform + random(PLATFORM_SPACING/3)));
    }

    if(dead){
        textSize(50);
        textAlign(CENTER, CENTER);
        fill(100, 50, 50);
        text("FORG IS KIL\n🐸", width/2+2, height/2+2);
        fill(255, 50, 50);
        text("FORG IS KIL\n🐸", width/2, height/2);
        textSize(14);
        fill(255)
        text("Press R to restart", width/2, height/2 + 80);

        if (keyIsPressed && key === 'r') {
            window.reload(); // todo
        }
        return;
    }


    //========== DISPLAY ==========//
    // Background
    background(105, 202, 255);
    textSize(80);
    fill(255, 240);
    text("☀️", 4*width/5, height/5);
    
    for (let c = 0; c < clouds.length; c++) {
        const cloud = clouds[c];
        const pos = frameCount + cloud.delay;
        const posX = (pos % (1.5*width))-0.25*width;
        // const posY = floor(pos/width)*width;
        const posY = 0;

        textSize(cloud.size);
        text("☁️", posX, posY + 0.5*camY);

        if (posX > 1.2*width) {
            clouds[c] = createCloud();
        }
    }
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
    if (elapsedTime > SPAWN_TIME){
        shark.spawn();
        startTime = millis();
    }
    
    forg.display();
    shark.display();


    // fill(255, 0, 0);
    // rect(mouseX, mouseY, 40, 40, 20);

    drawDebugGraphics();

    pop();

    drawHoldBar();

    fill(255);
    noStroke();
    textAlign(LEFT);
    textSize(20);
    text("Score: " + score.toFixed(2), 20, 30);
    textSize(10);

    text("⭐ Best: " + highscore.toFixed(2), 23, 44);
    textSize(15);
    textAlign(RIGHT);
    text((elapsedTime*0.001).toFixed(3) + "🕑", width-10, 30);

}

function calculateScore() {
    // Add meters/points to the score
    score = forg.posY/100;
    highscore = max(highscore, score);
}