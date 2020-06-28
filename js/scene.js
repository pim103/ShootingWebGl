import { Control } from "./control.js";
import { Camera } from "./camera.js";
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { FresnelShader } from '../jsm/shaders/FresnelShader.js';
import { Water } from '../jsm/objects/Water2.js';

export class Scene {
    scene;
    camera;
    renderer;
    control;
    textureLoader;

    objectInScene;
    mixers;
    clock;

    spheres;
    fountain;

    initInitialScene() {
        this.objectInScene = [];

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xbfd1e5 );
        this.camera = new Camera();
        this.control = new Control();

        this.clock = new THREE.Clock();
        this.mixers = [];

        this.camera.initCamera();
        this.control.initControl(this, this.camera.getCamera());
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

        this.createSpheres();
        // this.createCube();
        this.importGLTF("ShootingScene", "gltf");
        this.importGLTF("eagle", "gltf");
        this.importGLTF("canPos", "glb");
        this.addWater();
    }

    addWater() {
        const params = {
            color: '#ffffff',
            scale: 4,
            flowX: -1,
            flowY: 1
        };
        let waterGeometry = new THREE.PlaneBufferGeometry( 250, 5 );

        let water = new Water(waterGeometry, {
            color: params.color,
            scale: params.scale,
            flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
            textureWidth: 1024,
            textureHeight: 1024
        } );

        water.position.y = -3.1;
        water.position.z = -104;
        water.rotation.x = Math.PI * - 0.5;
        this.scene.add(water);

        // Fountain

        waterGeometry = new THREE.CircleGeometry( 7, 32 );
        water = new Water(waterGeometry, {
            color: params.color,
            scale: params.scale,
            flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
            textureWidth: 1024,
            textureHeight: 1024
        } );

        water.position.y = -1;
        water.position.z = -9;
        water.position.x = -29;

        water.rotation.x = Math.PI * - 0.5;
        this.fountain = [];
        
        water.visible = false;
        this.fountain.push(water);
        this.scene.add(water);

        waterGeometry = new THREE.CircleGeometry( 3, 8 );
        water = new Water(waterGeometry, {
            color: params.color,
            scale: params.scale,
            flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
            textureWidth: 1024,
            textureHeight: 1024
        } );

        water.position.y = 0;
        water.position.z = -9;
        water.position.x = -29;

        water.rotation.x = Math.PI * - 0.5;

        water.visible = false;
        this.fountain.push(water);
        this.scene.add(water);
    }

    initBackground() {
        const path = "imgs/skybox/";
        const format = ".png";
        const urls = [
            path + 'right' + format, path + 'left' + format,
            path + 'top' + format, path + 'bottom' + format, 
            path + 'back' + format, path + 'front' + format
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

    importGLTF(name, format) {
        let obj;

        const loader = new GLTFLoader()
            .setPath('../obj/');
        loader.load(name + "." + format, (gltf) => {
            obj = gltf.scene;
            obj.traverse((child) => {
                if (child.isMesh) {

                }
            });

            obj.position.y -= 3;
            obj.position.x += 10;
            obj.scale.x *= 8;
            obj.scale.y *= 8;
            obj.scale.z *= 8;

            const mixer = new THREE.AnimationMixer(obj);

            gltf.animations.forEach((animation) => {
                mixer.clipAction(animation).play();
            });

            this.mixers.push(mixer);

            this.objectInScene.push(obj);
            this.scene.add(obj);
        });
    }

    updateObject() {
        this.control.playIntent(this.objectInScene);

        var delta = this.clock.getDelta();

        this.mixers.forEach((mixer) => {
            mixer.update(delta);
        });

        const timer = 0.0001 * Date.now();
        
        let i = 0;
        this.spheres.forEach(sphere => {
            sphere.position.x = (5 * Math.cos(timer + i)) + 2;
            sphere.position.y = (5 * Math.sin(timer + i * 1.1));
            i++
        })
    }

    render(scenePhysics) {
        var deltaTime = scenePhysics.clock.getDelta();

        scenePhysics.updatePhysics( deltaTime );
        this.renderer.render( this.scene, this.camera.getCamera() );
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    createSpheres() {
        this.spheres = [];

        const geometry = new THREE.SphereBufferGeometry( 0.1, 32, 16 );

        const shader = FresnelShader;
        const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });

        for (let i = 0; i < 300; i++) {
            const mesh = new THREE.Mesh(geometry, material);

            uniforms["tCube"].value = this.scene.background;
            mesh.position.x = (Math.random() * 10 - 5) + 2;
            mesh.position.y = (Math.random() * 10 - 5) - 1;
            mesh.position.z = (Math.random() * 10 - 5) - 104;

            mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

            this.scene.add(mesh);
            this.spheres.push(mesh);
        }
    }

    createParalellepiped( sx, sy, sz, mass, pos, quat, material, scenePhysics ) {

        var threeObject = new THREE.Mesh( new THREE.BoxBufferGeometry( sx, sy, sz, 1, 1, 1 ), material );
        var shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
        shape.setMargin( scenePhysics.margin );

        threeObject.position.copy( pos );
        threeObject.quaternion.copy( quat );

        var transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        var motionState = new Ammo.btDefaultMotionState( transform );

        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        shape.calculateLocalInertia( mass, localInertia );

        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
        var body = new Ammo.btRigidBody( rbInfo );

        threeObject.userData.physicsBody = body;

        this.getScene().add( threeObject );

        if ( mass > 0 ) {

            scenePhysics.rigidBodies.push( threeObject );

            // Disable deactivation
            body.setActivationState( 4 );

        }

        scenePhysics.physicsWorld.addRigidBody( body );

        return threeObject;
    }

    createObjects(scenePhysics) {

        var pos = new THREE.Vector3();
        var quat = new THREE.Quaternion();

        // Ground
        pos.set( 0, -2, 0 );
        quat.set( 0, 0, 0, 1 );
        //var ground = createParalellepiped( 40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ), scenePhysics);
        var ground = new THREE.Mesh( new THREE.BoxBufferGeometry( 40, 1, 40, 1, 1, 1 ), new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
        var shape = new Ammo.btBoxShape( new Ammo.btVector3( 40 * 0.5, 1 * 0.5, 40 * 0.5 ) );
        shape.setMargin( scenePhysics.margin );

        ground.position.copy( pos );
        ground.quaternion.copy( quat );

        var transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        var motionState = new Ammo.btDefaultMotionState( transform );

        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        shape.calculateLocalInertia( 0, localInertia );

        var rbInfo = new Ammo.btRigidBodyConstructionInfo( 0, motionState, shape, localInertia );
        var body = new Ammo.btRigidBody( rbInfo );

        ground.userData.physicsBody = body;

        this.objectInScene.push(ground);
        this.getScene().add(ground);

        scenePhysics.physicsWorld.addRigidBody( body );

        var brickMass = 0.5;
        var brickLength = 1.2;
        var brickDepth = 0.6;
        var brickHeight = brickLength * 0.5;
        var numBricksLength = 6;
        var numBricksHeight = 4;
        var z0 = - numBricksLength * brickLength * 0.5;
        pos.set( 1, brickHeight * 0.5 -1.5, z0 );
        quat.set( 0, 0, 0, 1 );
        for ( var j = 0; j < numBricksHeight; j ++ ) {

            var oddRow = ( j % 2 ) == 1;

            pos.z = z0;

            if ( oddRow ) {

                pos.z -= 0.25 * brickLength;

            }

            var nRow = oddRow ? numBricksLength + 1 : numBricksLength;
            for ( var i = 0; i < nRow; i ++ ) {

                var brickLengthCurrent = brickLength;
                var brickMassCurrent = brickMass;
                if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {

                    brickLengthCurrent *= 0.5;
                    brickMassCurrent *= 0.5;

                }

                //var brick = createParalellepiped( brickDepth, brickHeight, brickLengthCurrent, brickMassCurrent, pos, quat, createMaterial() );
                var brick = new THREE.Mesh( new THREE.BoxBufferGeometry( brickDepth, brickHeight, brickLengthCurrent, 1, 1, 1 ), new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
                shape = new Ammo.btBoxShape( new Ammo.btVector3( brickDepth * 0.5, brickDepth * 0.5, brickDepth * 0.5 ) );
                shape.setMargin( scenePhysics.margin );

                brick.position.copy( pos );
                brick.quaternion.copy( quat );

                var transform = new Ammo.btTransform();
                transform.setIdentity();
                transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
                transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
                var motionState = new Ammo.btDefaultMotionState( transform );

                var localInertia = new Ammo.btVector3( 0, 0, 0 );
                shape.calculateLocalInertia( brickMassCurrent, localInertia );

                var rbInfo = new Ammo.btRigidBodyConstructionInfo( brickMassCurrent, motionState, shape, localInertia );
                var body = new Ammo.btRigidBody( rbInfo );

                brick.userData.physicsBody = body;

                this.objectInScene.push(brick)
                this.getScene().add(brick);

                if ( brickMassCurrent > 0 ) {

                    scenePhysics.rigidBodies.push(brick);

                    // Disable deactivation
                    body.setActivationState( 4 );
                }

                scenePhysics.physicsWorld.addRigidBody( body );

                brick.castShadow = true;
                brick.receiveShadow = true;

                if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {

                    pos.z += 0.75 * brickLength;

                } else {

                    pos.z += brickLength;

                }

            }
            pos.y += brickHeight;

        }
    }

    onWindowResize() {

        this.camera.getCamera().aspect = window.innerWidth / window.innerHeight;
        this.camera.getCamera().updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

}