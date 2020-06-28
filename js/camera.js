export class Camera {
    camera;
    listener;

    initCamera() {
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.x = 100;
        this.camera.position.z = 3;

        this.initListener();
    }

    getCamera() {
        return this.camera;
    }

    initListener() {
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        const sound = new THREE.Audio(this.listener);

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('../sounds/Yakov_Golman_-_02_-_Forest.mp3', (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
        });
    }
}