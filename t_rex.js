let ctx = document.querySelector('canvas').getContext('2d');

let state = document.getElementById('state');
let player_y_position = document.getElementById('player');
let dt = document.getElementById('dt');
let lagInfo = document.getElementById('lag');
let score = document.getElementById('score');


// # -- Public methods -- # //
let tools = {
    generateRandomRGBA: 'rgba(' + Math.floor(Math.random() * 365) + ',' + Math.floor(Math.random() * 365) + ',' + Math.floor(Math.random() * 365) + ',1)',
    randRGBA() {
        return this.generateRandomRGBA;
    },
    lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }
};

// # -- Game game_settings -- # //

let game_settings = {
    time: 1,
    score: '0',
    gravity: -0.75,
    acceleration: 0.8,
    ground: 10,
    friction: 0.9,
    time: 1,
    fps: 1000 / 60,
    bgColor: 'rgba(247,247,247,1)',
    game_over: false
}
// # -- DeltaTime -- # //

let fps = 60;
let previous = Date.now();
let now;
let lag;

let myInterval = setInterval(tick, 1000 / fps);

function tick() {
    now = Date.now();
    elapsedTime = now - previous;
    lag = elapsedTime - (1000 / fps);
    dt.innerHTML = 'DeltaTime: ' + elapsedTime + ' ms';
    lagInfo.innerHTML = 'Lag: ' + lag + ' ms';
    previous = now;
}

// # -- Resolution -- # //

function initializeResolution(width, height, color) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    if (color !== null) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        ctx.beginPath();
    }
}

// # -- World -- # //

function world() {
    ctx.beginPath();
    ctx.strokeStyle = tools.randRGBA();
    ctx.moveTo(0, ctx.canvas.height - game_settings.ground);
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height - game_settings.ground);
    ctx.stroke();
}

// # -- Controls-- # //

let controller = {
    left: false,
    right: false,
    up: false,
    keyListener(e) {
        let keyState = (e.type === 'keydown') ? true : false;

        switch (e.keyCode) {
            case 37: // left key
                controller.left = keyState;
                break;
            case 38: // up key
                controller.up = keyState;
                break;
            case 40: // down key
                controller.down = keyState;
                break;
            case 39: // right key
                controller.right = keyState;
                break;
        }
    },
};

window.addEventListener('keydown', controller.keyListener);
window.addEventListener('keyup', controller.keyListener);

// # -- Initialize resolution -- # //

(function initialize() {
    initializeResolution(700, 250, game_settings.bgColor);
})();

// # -- Enemies -- # //

let enemies = [];

function Enemy({
    xCor,
    yCor,
    width,
    height,
    xVel,
    color,
}) {
    this.xCor = xCor;
    this.yCor = yCor;
    this.width = width;
    this.height = height;
    this.xVel = xVel;
    this.color = color;
}

Enemy.prototype.draw = function () {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.strokeRect(this.xCor, this.yCor, this.width, this.height);
}

Enemy.prototype.update = function () {
    this.draw();
    this.xCor -= this.xVel;
}

let enemyType = [{
        type: 'one',
        width: 60,
        height: 30,
        xCor: ctx.canvas.width - 15,
        yCor: ctx.canvas.height - game_settings.ground,
        xVel: 4,
        color: 'rgba(87,87,87,1)'
    },
    {
        type: 'two',
        width: 30,
        height: 60,
        xCor: ctx.canvas.width - 15,
        yCor: ctx.canvas.height - game_settings.ground,
        xVel: 4,
        color: 'rgba(87,87,87,1)'
    },
    {
        type: 'three',
        width: 30,
        height: 30,
        xCor: ctx.canvas.width - 15,
        yCor: ctx.canvas.height - game_settings.ground,
        xVel: 4,
        color: 'rgba(87,87,87,1)'
    },
    {
        type: 'bird',
        width: 30,
        height: 30,
        xCor: ctx.canvas.width - 15,
        yCor: ctx.canvas.height - game_settings.ground,
        xVel: 4,
        color: 'rgba(87,87,87,1)'
    },
];

function updateEnemyData(arr, val) {
    if(arr && val ) {
        arr.forEach(el => {
            el.xVel = val; 
        });
    }
}

enemyType.forEach(el => {
    el.type !== 'bird' ? el.yCor -= el.height : el.yCor -= el.height * 2;
});

let spawn = {
    interval: 2000,
    currentCheckPoint: 50,
    start() {
        let spawn_interval = setInterval(() => {
            enemies.push(new Enemy(enemyType[Math.floor(Math.random() * enemyType.length)]));
        }, this.interval);
    }
};
spawn.start();
function checkScore() {
    if (parseInt(game_settings.score, 10) > spawn.currentCheckPoint) {
        spawn.currentCheckPoint += 100;
        let currentxVel = enemyType[0]['xVel'];
        currentxVel > 10 ? currentxVel : currentxVel += .5;
        updateEnemyData(enemyType, currentxVel)
        console.log(`reached ${spawn.currentCheckPoint} next checkpoint ${spawn.currentCheckPoint + 100} `)
    }
}
// # -- Player -- # //

let player = {
    xCor: 50,
    yCor: ctx.canvas.height / 2,
    width: 20,
    height: 40,
    color: 'rgba(87,87,87,1)',
    xVel: 0,
    yVel: 0,
    is_jumping: false,
    state: 'idle',
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.xCor, this.yCor, this.width, this.height);
    },
    log() {
        state.innerHTML = 'State : ' + this.state;
        player_y_position.innerHTML = 'Player yCor pos: ' + this.yCor;
        player_y_position.innerHTML = 'Player yCor pos: ' + this.yCor;
        score.innerHTML = 'Score ' + game_settings.score;
    },
    physics() {
        this.yCor -= this.yVel;
        this.yVel += game_settings.gravity; // adding gravity.

        if (this.yCor + this.height - this.yVel > ctx.canvas.height) {
            this.yCor = ctx.canvas.height - (this.height + game_settings.ground);
        }
        if ((this.yCor + this.height) + game_settings.ground == ctx.canvas.height) {
            this.state = 'idle';
        } else {
            this.state = 'jumping';
        }
    },
    controls() {
        if (controller.up && this.state == 'idle') {
            this.yVel = 13;
        }
        if (controller.down) {
            this.yVel += -3;
            this.height = tools.lerp(this.height, 20, 0.5);
            this.width = tools.lerp(this.width, 40, 0.5);

        } else {
            this.width = tools.lerp(this.width, 20, 0.5);
            this.height = tools.lerp(this.height, 40, 0.1);
        }
    },
    update() {
        this.draw();
        this.physics();
        this.controls();
        this.log();

    }
}

// # -- Clear memory -- # //

function clearMem() {
    if (enemies.length >= 0) {
        for (let i = 0; i < enemies.length; i++) {
            if (enemies[i].xCor + enemies[i].width < 0) {
                enemies.splice(i, 1);
            }
        }
    }
}

// # -- Collision detection -- # //

function isCollided() {
    if (enemies.length > 0) {
        for (let i = 0; i < enemies.length; i++) {
            if (player.xCor + player.width >= enemies[i].xCor && enemies[i].xCor + enemies[i].width >= player.xCor && player.yCor + player.height >= enemies[i].yCor) {
                return {
                    bool: false,
                    enemy: enemies[i]
                };
            } else {
                return {
                    bool: false,
                    enemy: enemies[i]
                };
            }
        }
    }
}

// # -- Update -- # //

(function update() {
    window.requestAnimationFrame(update);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    world();
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
    player.update();
    clearMem();
    gameManager();
    checkScore()
})();

function gameManager() {
    if (typeof isCollided() == 'object') {
        let {
            bool,
            enemy,
            randRGBA
        } = isCollided();
        if (bool) {
            enemy.color = tools.randRGBA();
            game_settings.game_over = true;
            clearInterval(startScore);
        } else {
            enemy.color = 'rgba(87,87,87,1)';
        }
    }
}
// Score //

let digits = [];
let len = 5;

function Digit(i, len, currentVal) {
    this.i = i;
    this.currentVal = currentVal;
    this.len = len;
}
Digit.prototype.update = function () {
    let previousDigit = this.i + 1 > this.len ? null : digits[this.i + 1];
    if (!previousDigit) {
        this.currentVal++;
    } else if (previousDigit.currentVal > 8) {
        this.currentVal++;
        previousDigit.currentVal = 0;
    }
    let values = [];
    for (i = 0; i < digits.length; i++) {
        values.push(digits[i].currentVal);
    }
    game_settings.score = values.toString().replace(/,/g, "");
}

for (let i = 0; i < len; i++) {
    digits.push(new Digit(i, len, 0))
}

let startScore = setInterval(() => {
    for (let i = 0; i < digits.length; i++) {
        digits[i].update();
    }
}, 100)