import { Scene } from "./scene.js";

const currentScene = new Scene();

function animate() {
    requestAnimationFrame( animate );
    currentScene.render()

    currentScene.updateObject();
}

	// Physics variables
	var gravityConstant = 7.8;
	var collisionConfiguration;
	var dispatcher;
	var broadphase;
	var solver;
	var physicsWorld;
	var margin = 0.05;

	// Rigid bodies include all movable objects
	var rigidBodies = [];

	var pos = new THREE.Vector3();
	var quat = new THREE.Quaternion();
	var transformAux1;
	var tempBtVec3_1;
	var mouseCoords = new THREE.Vector2()
	var raycaster = new THREE.Raycaster();
	var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );

	var clock = new THREE.Clock();

$('document').ready(() => {
    currentScene.initInitialScene();
    Ammo().then( function ( AmmoLib ) {

			Ammo = AmmoLib;

			currentScene.initPhysics(collisionConfiguration, dispatcher, broadphase, solver, physicsWorld, transformAux1, tempBtVec3_1, gravityConstant);
    		currentScene.initInput(mouseCoords,raycaster,currentScene,ballMaterial,margin,pos,quat,rigidBodies,physicsWorld);
		} );
    

    animate(currentScene);
});