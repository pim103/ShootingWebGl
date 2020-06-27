import { Control } from "./control.js";
import { Camera } from "./camera.js";
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';

export class Scene {
    scene;
    camera;
    renderer;
    control;
    textureLoader;

    objectInScene;

    initInitialScene() {
        this.objectInScene = [];

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xbfd1e5 );
        this.camera = new Camera();
        this.control = new Control();

        this.camera.initCamera();
        this.control.initControl(this.camera.getCamera());
        this.scene.add(this.control.getControl().getObject());

        /*this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );*/


        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild( this.renderer.domElement );

        this.initBackground();

        this.textureLoader = new THREE.TextureLoader();

        var ambientLight = new THREE.AmbientLight( 0x404040 );
        this.scene.add( ambientLight );

        var light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set( - 10, 10, 5 );
        light.castShadow = true;
        var d = 20;
        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;

        light.shadow.camera.near = 2;
        light.shadow.camera.far = 50;

        light.shadow.mapSize.x = 1024;
        light.shadow.mapSize.y = 1024;

        this.scene.add( light );

        window.addEventListener( 'resize', () => {
            this.onWindowResize();
        }, false );

        this.createCube();
        this.importGLTF();
    }

    initBackground() {
        const path = "imgs/skybox/";
        const format = ".jpg";
        const urls = [
            path + 'posx' + format, path + 'negx' + format,
            path + 'posy' + format, path + 'negy' + format, 
            path + 'posz' + format, path + 'negz' + format
        ];

        const textureBackground = new THREE.CubeTextureLoader().load(urls);

        this.scene.background = textureBackground;
    }

    createCube() {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        const cube = new THREE.Mesh(geometry, material);

        this.objectInScene.push(cube);
        this.scene.add(cube);
    }

    importGLTF() {
        let obj;

        const loader = new GLTFLoader()
            .setPath('../obj/');
        loader.load('tree.glb', (gltf) => {
            obj = gltf.scene;
            obj.traverse((child) => {
                if (child.isMesh) {

                }
            });

            obj.position.y -= 3;
            obj.position.x += 10;
            this.objectInScene.push(obj);
            this.scene.add(obj);
        });
    }

    updateObject() {
        // this.objectInScene.forEach(object => {
        //     object.rotation.x += 0.01;
        //     object.rotation.y += 0.01;
        // });

        this.control.playIntent(this.objectInScene);
    }

    render() {
        /*var deltaTime = clock.getDelta();

        updatePhysics( deltaTime );*/
        this.renderer.render( this.scene, this.camera.getCamera() );
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    onWindowResize() {

        this.camera.getCamera().aspect = window.innerWidth / window.innerHeight;
        this.camera.getCamera().camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }

    initInput(mouseCoords,raycaster,currentScene,ballMaterial,margin,pos,quat,rigidBodies,physicsWorld) {

        window.addEventListener( 'mousedown', function ( event ) {

            mouseCoords.set(
                ( event.clientX / window.innerWidth ) * 2 - 1,
                - ( event.clientY / window.innerHeight ) * 2 + 1
            );

            raycaster.setFromCamera(mouseCoords, currentScene.getCamera().getCamera());

            // Creates a ball and throws it
            var ballMass = 35;
            var ballRadius = 0.4;

            var ball = new THREE.Mesh( new THREE.SphereBufferGeometry( ballRadius, 14, 10 ), ballMaterial );
            ball.castShadow = true;
            ball.receiveShadow = true;
            var ballShape = new Ammo.btSphereShape( ballRadius );
            ballShape.setMargin( margin );
            pos.copy( raycaster.ray.direction );
            pos.add( raycaster.ray.origin );
            quat.set( 0, 0, 0, 1 );
            //var ballBody = createRigidBody( ball, ballShape, ballMass, pos, quat );

            ball.position.copy( pos );
            ball.quaternion.copy( quat );

            var transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
            transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
            var motionState = new Ammo.btDefaultMotionState( transform );

            var localInertia = new Ammo.btVector3( 0, 0, 0 );
            ballShape.calculateLocalInertia( ballMass, localInertia );

            var rbInfo = new Ammo.btRigidBodyConstructionInfo( ballMass, motionState, ballShape, localInertia );
            var body = new Ammo.btRigidBody( rbInfo );

            ball.userData.physicsBody = body;

            currentScene.getScene().add( ball );

            if ( ballMass > 0 ) {

                rigidBodies.push( ball );

                // Disable deactivation
                body.setActivationState( 4 );

            }

            physicsWorld.addRigidBody( body );

            pos.copy( raycaster.ray.direction );
            pos.multiplyScalar( 24 );
            body.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );

        }, false );

    }

    initGraphics() {

        container = document.getElementById( 'container' );

        scene.background = new THREE.Color( 0xbfd1e5 );

        camera.position.set( - 7, 5, 8 );

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.shadowMap.enabled = true;
        container.appendChild( renderer.domElement );

        controls = new OrbitControls( camera, renderer.domElement );
        controls.target.set( 0, 2, 0 );
        controls.update();

        textureLoader = new THREE.TextureLoader();

        var ambientLight = new THREE.AmbientLight( 0x404040 );
        scene.add( ambientLight );

        var light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set( - 10, 10, 5 );
        light.castShadow = true;
        var d = 20;
        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;

        light.shadow.camera.near = 2;
        light.shadow.camera.far = 50;

        light.shadow.mapSize.x = 1024;
        light.shadow.mapSize.y = 1024;

        scene.add( light );

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild( stats.domElement );


        window.addEventListener( 'resize', onWindowResize, false );

    }

    initPhysics(collisionConfiguration, dispatcher, broadphase, solver, physicsWorld, transformAux1, tempBtVec3_1, gravityConstant) {

        // Physics configuration

        collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
        broadphase = new Ammo.btDbvtBroadphase();
        solver = new Ammo.btSequentialImpulseConstraintSolver();
        physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
        physicsWorld.setGravity( new Ammo.btVector3( 0, - gravityConstant, 0 ) );

        transformAux1 = new Ammo.btTransform();
        tempBtVec3_1 = new Ammo.btVector3( 0, 0, 0 );

    }
}