currentScene = new Scene();

function animate() {
    requestAnimationFrame( animate );
    currentScene.render()

    currentScene.updateObject();
}

$('document').ready(() => {
    currentScene.initInitialScene();

    animate(currentScene);
});