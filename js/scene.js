import { Control } from "./control.js";

export class Scene {
    scene;
    camera;
    renderer;
    control;

    objectInScene;

    initInitialScene() {
        this.objectInScene = [];

        this.scene = new THREE.Scene();
        this.camera = new Camera();
        this.control = new Control();

        this.camera.initCamera();
        this.control.initControl(this.camera.getCamera());
        this.scene.add(this.control.getControl().getObject());

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );

        this.initBackground();
        this.createCube();
    }

    async initBackground() {
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

    updateObject() {
        this.objectInScene.forEach(object => {
            object.rotation.x += 0.01;
            object.rotation.y += 0.01;
        });

        this.control.playIntent();
    }

    render() {
        this.renderer.render( this.scene, this.camera.getCamera() );
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
}