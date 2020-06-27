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

        let materialArray = [];
        let texture_ft = new THREE.TextureLoader().load( path + 'negz.jpg');
        let texture_bk = new THREE.TextureLoader().load( path + 'posz.jpg');
        let texture_up = new THREE.TextureLoader().load( path + 'posy.jpg');
        let texture_dn = new THREE.TextureLoader().load( path + 'negy.jpg');
        let texture_rt = new THREE.TextureLoader().load( path + 'posx.jpg');
        let texture_lf = new THREE.TextureLoader().load( path + 'negx.jpg');
        
        materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
        
        for (let i = 0; i < 6; i++) {
            materialArray[i].side = THREE.BackSide;
        }

        let skyboxGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
        let skybox = new THREE.Mesh( skyboxGeo, materialArray );
        this.scene.add( skybox );
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