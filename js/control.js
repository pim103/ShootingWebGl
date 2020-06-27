import { PointerLockControls } from "../jsm/controls/PointerLockControls.js";

export class Control {
    control;
    prevTime;

    moveLeft = false;
    moveRight = false;
    moveForward = false;
    moveBackward = false;
    canJump = false;
    
    velocity = new THREE.Vector3();
    direction = new THREE.Vector3();
    raycaster;
    mouse;

    onKeyDown(event) {
        switch ( event.keyCode ) {
            case 38: // up
            case 90: // z
                this.moveForward = true;
                break;

            case 37: // left
            case 81: // q
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
                if ( this.canJump === true ) {
                    this.velocity.y += 30;
                }
                this.canJump = false;
                break;
            
            case 76: //l
                this.control.lock();
                break;
        }
    };

    onKeyUp(event) {
        switch ( event.keyCode ) {
            case 38: // up
            case 90: // z
                this.moveForward = false;
                break;

            case 37: // left
            case 81: // q
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

        this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
        this.mouse = new THREE.Vector2( 1, 1 );

        document.addEventListener('click', () => {
            this.control.lock();
        }, false);
        document.addEventListener('keydown', () => {
            this.onKeyDown(event);
        }, false);
        document.addEventListener('keyup', () => {
            this.onKeyUp(event);
        }, false);
        document.addEventListener('mousemove', () => {
            this.onMouseMove(event);
        }, false );
    }

    getControl() {
        return this.control;
    }

    onMouseMove(event) {

        event.preventDefault();

        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    }

    playIntent(objects) {
        var time = performance.now();
        var delta = ( time - this.prevTime ) / 1000;
        
        let onObject = false;

        if (objects != undefined) {
            this.raycaster.ray.origin.copy(this.control.getObject().position);
            this.raycaster.ray.origin.y -= 3;
            const intersections = this.raycaster.intersectObjects(objects, true);
            intersections.sort((intersect1, intersect2) => {
                intersect1.distance - intersect2.distance;
            });

            onObject = intersections.length > 0 && intersections[0].distance < 0.7;
        }
        

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 10.0 * delta;

        if (onObject) {
            this.velocity.y = Math.max( 0, this.velocity.y );
            this.canJump = true;
        }

        this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
        this.direction.x = Number( this.moveRight ) - Number( this.moveLeft );
        this.direction.normalize(); // this ensures consistent movements in all directions

        if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 150.0 * delta;
        if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 150.0 * delta;
    
        this.control.moveRight( - this.velocity.x * delta );
        this.control.moveForward( - this.velocity.z * delta );

        this.control.getObject().position.y += ( this.velocity.y * delta );

        if (this.control.getObject().position.y < 0) {
            this.velocity.y = 0;
            this.control.getObject().position.y = 0;

            this.canJump = true;
        }

        this.prevTime = time;
    }
}