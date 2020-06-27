import { PointerLockControls } from "../jsm/controls/PointerLockControls.js";

export class Control {
    control;
    prevTime;

    moveLeft = false;
    moveRight = false;
    moveForward = false;
    moveBackward = false;
    
    velocity = new THREE.Vector3();
    direction = new THREE.Vector3();

    onKeyDown(event) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;

            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                this.moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;

            case 32: // space
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;
        }
    };

    onKeyUp(event) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;

            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;
        }
    };

    initControl(camera) {
        this.control = new PointerLockControls(camera, document.body);

        this.prevTime = performance.now();

        document.addEventListener('keydown', () => {
            this.onKeyDown(event);
        }, false);
        document.addEventListener('keyup', () => {
            this.onKeyUp(event);
        }, false);
    }

    getControl() {
        return this.control;
    }

    playIntent() {
        var time = performance.now();
        var delta = ( time - this.prevTime ) / 1000;
        
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 100.0 * delta;

        this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
        this.direction.x = Number( this.moveRight ) - Number( this.moveLeft );
        this.direction.normalize(); // this ensures consistent movements in all directions

        if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 400.0 * delta;
        if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 400.0 * delta;
    
        this.control.moveRight( - this.velocity.x * delta );
        this.control.moveForward( - this.velocity.z * delta );

        // this.control.getObject().position.y += ( this.velocity.y * delta );

        this.prevTime = time;
    }
}