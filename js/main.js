import { Scene } from "./scene.js";
import { Physics } from "./physics.js";

const currentScene = new Scene();
var scenePhysics = new Physics();
function animate() {
    requestAnimationFrame( animate );
    currentScene.render(scenePhysics)

    currentScene.updateObject();
}

jQuery('document').ready(() => {
    currentScene.initInitialScene();
    Ammo().then( function ( AmmoLib ) {

			Ammo = AmmoLib;

			scenePhysics.initPhysics();
    		scenePhysics.initInput(currentScene, scenePhysics);
		} );
    
    currentScene.createObjects(scenePhysics);
    animate(currentScene);
});