import { Scene } from "./scene.js";

const currentScene = new Scene();

function animate() {
    requestAnimationFrame( animate );
    currentScene.render()

    currentScene.updateObject();
}

$('document').ready(() => {
    currentScene.initInitialScene();

    animate(currentScene);
});