let ctx = document.querySelector('canvas').getContext('2d');

let state = document.getElementById('state');
let player_y_position = document.getElementById('player');
let dt = document.getElementById('dt');


// # -- Game settings -- # //

let settings = {
    gravity: -0.7,
    acceleration: 0.8,
    ground: 10,
    friction: 0.9,
    time : 1,
    fps: 1000/60,
    bgColor: 'rgba(247,247,247,1)'
}

// # -- DeltaTime -- # //

let lastTime = Date.now();
let deltaTime;
let lag;
let elapsedTime = setInterval( tick, settings.fps );

function tick() {
    let now = Date.now();
    deltaTime = now - lastTime;
    lag = deltaTime - settings.fps;
    if( deltaTime > settings.fps) {
        update
    }
    lastTime = now;
    dt.innerHTML = 'DeltaTime: ' + 0.001 * deltaTime + ' s';
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
    ctx.strokeStyle = 'rgba(87,87,87,1)';
    ctx.moveTo(0, ctx.canvas.height - settings.ground);
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height - settings.ground);
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
    initializeResolution( 700, 250, settings.bgColor );
})();

// # -- Enemies -- # //

let enemies = [];

function Enemy(x,y,w,h,color) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.x_velocity = 5;
    this.height = h;
    this.color = color;
    this.time = 0;
}

Enemy.prototype.draw = () => {
    ctx.fillStyle = this.color;
    ctx.fillRect( this.x, this.y, this.width, this.height );
}

Enemy.prototype.update =  (dt) => {
    this.draw();
    this.time += 0.01;
    this.x -= this.x_velocity * dt;
    // for( let i = 0; i < enemies.length; i++ ) {
    // }
}

// # -- Player -- # //

let player = {
    x: 50,
    y: ctx.canvas.height / 2,
    width: 20,
    height: 20,
    color: 'rgba(87,87,87,1)',
    x_velocity: 0,
    y_velocity: 0,
    is_jumping: false,
    state: 'idle',
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect( this.x, this.y, this.width, this.height );
    },
    controls() {
        this.y += -this.y_velocity;

        this.y_velocity += settings.gravity; // adding gravity.

        if( this.y + this.height >= ctx.canvas.height ) {
            this.y = ctx.canvas.height - ( this.height + settings.ground );
        }
        if( ( this.y + this.height) + settings.ground == ctx.canvas.height ) {
            this.state = 'idle';
        } else {
            this.state = 'jumping';
        }
        if( controller.up && this.state == 'idle' ) {
            this.y_velocity = 10 ;
        }

        state.innerHTML = 'State : ' + this.state;
        player_y_position.innerHTML = 'Player Y pos: ' + this.y;
    },
    update() {
        this.draw();
        this.controls();
    }
}

let spawnEnemy = {
    x: ctx.canvas.width - 15,
    y: ctx.canvas.height - settings.ground - 30,
    w: 30,
    h: 30,
    counter: 1,
    color: 'rgba(87,87,87,1)',
    respawn() {
        this.counter++;
        if( this.counter >= 100 ) {
            enemies.push( new Enemy(this.x, this.y, this.w, this.h, this.color) );
            this.counter = 0;
        }
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

function collisionDetection() {
    for( let i = 0; i < enemies.length; i++ ) {
        let randomRGBA = 'rgba(' + Math.random() * 365 + ',' + Math.random() * 365 + ',' + Math.random() * 365 + ',1)';
        if ( player.x + player.width >= enemies[i].x && enemies[i].x + enemies[i].width >= player.x && player.y + player.height >= enemies[i].y ) {
            enemies[i].color = randomRGBA;
            window.cancelAnimationFrame(loop)
        } else {
            enemies[i].color = 'rgba(87,87,87,1)';
        }
    } 
}

// # -- Details -- # //

function details() {
    ctx.font = "15px Arial";
    ctx.fillText(player.x, 10, 50);
    for( let i = 0; i < enemies.length; i++ ) {
        ctx.fillText(enemies[i].x, 10, 80);
    }
}

// # -- Update -- # //

function update(dt) {
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    world();
    for( let i = 0; i < enemies.length; i++ ) {
        enemies[i].update(dt);
    }
    player.update(dt);
    collisionDetection();
    clearMem();
    details();
    spawnEnemy.respawn();
};

