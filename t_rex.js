let ctx = document.querySelector('canvas').getContext('2d');

let state = document.getElementById('state');
let player_y_position = document.getElementById('player');
let dt = document.getElementById('dt');
let lagInfo = document.getElementById('lag');
let score = document.getElementById('score');


// # -- Public methods -- # //
let tools = {
    generateRandomRGBA : 'rgba(' + Math.random() * 365 + ',' + Math.random() * 365 + ',' + Math.random() * 365 + ',1)',
    randRGBA() {
        return this.generateRandomRGBA;
    }
};

// # -- Game game_settings -- # //

let game_settings = {
    time: 1,
    score:0,
    gravity: -0.7,
    acceleration: 0.8,
    ground: 10,
    friction: 0.9,
    time : 1,
    fps: 1000/60,
    bgColor: 'rgba(247,247,247,1)',
    game_over: false
}
// # -- DeltaTime -- # //

let fps = 60;
let previous = Date.now();
let now;
let lag;

let myInterval = setInterval( tick, 1000 / fps );

function tick() {
  now = Date.now();
  elapsedTime = now - previous;
  lag = elapsedTime - ( 1000 / fps );
  dt.innerHTML = 'DeltaTime: ' + elapsedTime + ' ms';
  lagInfo.innerHTML = 'Lag: ' + lag + ' ms';
  previous = now;
}

// # -- Resolution -- # //

function initializeResolution( w, h, color ) {
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    if( color !== null ) {
        ctx.fillStyle = color;
        ctx.fillRect( 0, 0, w, h );
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

        switch(e.keyCode) {
            case 37: // left key
                controller.left = keyState;
            break;

            case 38: // up key
                controller.up = keyState;
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
    initializeResolution( 700, 250, game_settings.bgColor );
})();

// # -- Enemies -- # //

let enemies = [];

function Enemy(x,y,w,h,color,timeout) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.x_velocity = 5;
    this.timeout = timeout;
    this.height = h;
    this.color = color;
    this.time = 0;
}

Enemy.prototype.draw = function() {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.strokeRect( this.x, this.y, this.width, this.height );
}

Enemy.prototype.update = function() {
    this.draw();
    this.time += 0.01;
    this.x -= this.x_velocity ;
}

// # -- Player -- # //

let player = {
    x: 50,
    y: ctx.canvas.height / 2,
    width: 20,
    height: 40,
    color: 'rgba(87,87,87,1)',
    x_velocity: 0,
    y_velocity: 0,
    is_jumping: false,
    state: 'idle',
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect( this.x, this.y, this.width, this.height );
    },
    controls() {
        this.y -= this.y_velocity;

        this.y_velocity += game_settings.gravity; // adding gravity.

        if( this.y + this.height - this.y_velocity > ctx.canvas.height ) {
            this.y = ctx.canvas.height - ( this.height + game_settings.ground );
        }
        if( ( this.y + this.height) + game_settings.ground == ctx.canvas.height ) {
            this.state = 'idle';
        } else {
            this.state = 'jumping';
        }
        if( controller.up && this.state == 'idle' ) {
            this.y_velocity = 11;
        }

        state.innerHTML = 'State : ' + this.state;
        player_y_position.innerHTML = 'Player Y pos: ' + this.y;
        player_y_position.innerHTML = 'Player Y pos: ' + this.y;
        score.innerHTML = 'Score ' + game_settings.score;
    },
    update() {
        this.draw();
        this.controls();
    }
}


// # -- Clear memory -- # //

function clearMem() {
    if( enemies.length >= 0 ) {
        for( let i = 0; i < enemies.length; i++ ) {
            if ( enemies[i].x + enemies[i].width < 0 ) {
                enemies.splice( i , 1 );
            }
        } 
    }
}

// # -- Collision detection -- # //

function isCollided() {
    if(enemies.length>0) {
        for( let i = 0; i < enemies.length; i++ ) {
            if ( player.x + player.width >= enemies[i].x && enemies[i].x + enemies[i].width >= player.x && player.y + player.height >= enemies[i].y ) {
                return {bool:true,enemy:enemies[i] };
            } else {
                return {bool:false,enemy:enemies[i]};
            }
        } 
    }
}

let spawn = {
    x: ctx.canvas.width - 15,
    y: ctx.canvas.height - game_settings.ground - 30,
    w: 30,
    h: 30,
    counter: 0,
    color: 'rgba(87,87,87,1)',
    start() {
        setInterval(() => {
            enemies.push( new Enemy(this.x, this.y, this.w, this.h, this.color) );
        }, 1000)
    }
};
spawn.start();

// # -- Update -- # //
let digits = [];

(function update() {
    window.requestAnimationFrame(update);
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    world();
    for( let i = 0; i < enemies.length; i++ ) {
        enemies[i].update();
    }
    player.update();
    clearMem();
    gameManager();
})();

// Game Management //
function gameManager() {
    if(typeof isCollided() == 'object') {
        let {bool,enemy,randRGBA} = isCollided();
        if(bool) {
            enemy.color = tools.randRGBA();
            game_settings.game_over = true;
            clearInterval(startScore)
        } else {
            enemy.color = 'rgba(87,87,87,1)';
        }
    }
}

let len = 5;
function Digit(i,len, currentVal) {
    this.i = i;
    this.currentVal = currentVal;
    this.len = len;
}
Digit.prototype.update = function() {
        let previousDigit = this.i + 1 > this.len ? null : digits[this.i+1];
        if(!previousDigit) {
            this.currentVal++;
        } else if(previousDigit.currentVal > 8) {
            this.currentVal++;
            previousDigit.currentVal = 0;
        }

        let values = [];
        for (i=0; i<digits.length;i++) {
            values.push(digits[i].currentVal);
            
        }
        game_settings.score = values.toString().replace(/,/g,"");
}

for(let i=0; i<len; i++) {
    digits.push(new Digit(i,len,0))
}

let startScore = setInterval(() => {
    for(let i=0; i<digits.length; i++) {
        digits[i].update();
    }
}, 100)