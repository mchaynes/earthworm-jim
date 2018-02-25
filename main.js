var AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, 0, 0, 1200, 922, 0, 0, 800, 700);
};

Background.prototype.update = function () {
};

// inheritance 
function Cheetah(game) {
    this.pantsAnimation = new Animation(AM.getAsset("./img/jimheartpants.png"), 100, 80, 7, 0.1, 64, false, 1);
    this.walkAnimation = new Animation(AM.getAsset("./img/tiptoe.png"), 64, 60, 4, 0.15, 14, true, 1);
    this.fallAnimation = new Animation(AM.getAsset("./img/fall 2.png"), 74, 90, 2, 0.1, 2, true, 1);
    this.landAnimation = new Animation(AM.getAsset("./img/land.png"), 74, 90, 1, .5, 1, false, 1);
    this.animation = this.pantsAnimation;
    this.speed = 0;
    this.ctx = game.ctx;
    Entity.call(this, game, 15, 220);
}

Cheetah.prototype = new Entity();
Cheetah.prototype.constructor = Cheetah;

Cheetah.prototype.update = function () {
    this.x += this.game.clockTick * this.speed;
    if(this.animation === this.pantsAnimation && this.pantsAnimation.isDone()) {
        this.animation = this.walkAnimation;
        this.y += 20;
        this.x += 10;
        this.speed = 30;
    } else if(this.animation === this.landAnimation) {
        this.speed = 0;
    } else if(this.pantsAnimation.isDone()) {
        this.speed = 30;
    }
    if((this.x >= 155 && this.y < 465) || (this.x >= 290 && this.y < 560)) {
        this.y += 1;
        this.falling = true;
    } else if(this.x > 300 && this.y < 620) {
        if(this.fallAnimation === this.animation) {
            this.animation = this.landAnimation;
            this.falling = false;
        } else if (this.landAnimation.isDone()) {
            this.animation = this.walkAnimation;
            this.y += .4;
        }
    } else if(this.animation === this.fallAnimation) {
        this.falling = false;
        this.animation = this.landAnimation;
    }
    if(this.falling) {
        this.animation = this.fallAnimation;
    } else if(this.animation === this.landAnimation && this.landAnimation.isDone()) {
        this.animation = this.walkAnimation;
        this.landAnimation.elapsedTime = 0;
        this.y += 15;
    }

    if (this.x > 800) {
        this.x = 15;
        this.y = 220;
        this.pantsAnimation.elapsedTime = 0;
        this.landAnimation.elapsedTime = 0;
        this.walkAnimation.elapsedTime = 0;
        this.animation = this.pantsAnimation;
        this.speed = 0;
    };
    Entity.prototype.update.call(this);
}

Cheetah.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

AM.queueDownload("./img/jimheartpants.png");
AM.queueDownload("./img/level.png");
AM.queueDownload("./img/tiptoe.png");
AM.queueDownload("./img/fall 2.png");
AM.queueDownload("./img/land.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/level.png")));
    gameEngine.addEntity(new Cheetah(gameEngine));

    console.log("All Done!");
});