class Scene {
    scene;
    camera;
    renderer;

    objectInScene;

    initInitialScene() {
        this.objectInScene = [];

        this.scene = new THREE.Scene();
        this.camera = new Camera();

        this.camera.initCamera();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );

        this.createCube();
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