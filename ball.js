let ctx = document.querySelector('canvas').getContext('2d');

// # -- Game settings -- # //

let settings = {
    gravity: 4,
    acceleration: 2,
    friction: 0.9,
    bgColor: 'black'
}
// # -- Resolution -- # //
function initializeResolution( w, h, color ) {
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    if( color !== null ) {
        ctx.fillStyle = color;
        ctx.fillRect( 0, 0, w, h );
    }
}

// # -- Events -- # //

window.addEventListener('resize', () => {
    initializeResolution( window.innerWidth, window.innerHeight, settings.bgColor );
}, false);


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
    initializeResolution( window.innerWidth, window.innerHeight, settings.bgColor );
})();

// # -- Enemies -- # //

let enemies = [];

function Enemy(x,y,w,h,color) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.color = color;
}

Enemy.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect( this.x, this.y, this.width, this.height );
}

Enemy.prototype.update = function () {
    this.draw();
    this.x -= 5;

    for ( let i = 0; i < enemies.length; i++ ) {
        if( enemies[i].x <= -100 ) {
            enemies.splice( i , 1 );
        }
    }

    if ( this.x <= -100) {
        enemies.pop();
        enemies.push( new Enemy ( ctx.canvas.width - 100, ctx.canvas.height - 200, 100, 20, 'green') );
    }
}

// # -- Player -- # //

let player = {
    x: ctx.canvas.width / 2,
    y: ctx.canvas.height / 2,
    width: 100,
    height: 100,
    color: 'red',
    x_velocity: 0,
    y_velocity: 0,
    is_jumping: false,
    jump_height: 70,
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect( this.x, this.y, this.width, this.height );
    },
    controls() {

        if(controller.up && this.is_jumping == false) { // Up
            this.y_velocity -= this.jump_height;
            this.is_jumping = true;
        }

        if(controller.left) { // Left
            this.x_velocity -= 2;
        }

        if(controller.right) { // Right
            this.x_velocity += 2;
        }

        this.y_velocity += settings.gravity;// Gravity
        this.y += this.y_velocity;
        this.x += this.x_velocity;
        this.x_velocity *= settings.friction; // X friction
        this.y_velocity *= settings.friction; // Y friction

        if(this.y + this.height > ctx.canvas.height) {
            this.y = ctx.canvas.height - this.height;
            this.is_jumping = false;
            this.y_velocity = 0;
        }
    },
    update() {
        this.draw();
        this.controls();
    }
}



for( let i = 0; i < 1 ; i++ ) {
    enemies.push( new Enemy ( ctx.canvas.width - 100, ctx.canvas.height - 200, 100, 20, 'green') );
}

// # -- Update -- # //

let animate = setInterval( () => {
    initializeResolution( window.innerWidth, window.innerHeight, settings.bgColor );
    for( let i = 0; i < enemies.length; i++ ) {
        enemies[i].update();
    }
    player.update();
}, 1000/60);

