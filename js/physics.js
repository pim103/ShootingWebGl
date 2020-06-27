export class Physics {

	// Physics variables
	gravityConstant;
	collisionConfiguration;
	dispatcher;
	broadphase;
	solver;
	physicsWorld;
	margin;

	// Rigid bodies include all movable objects
	rigidBodies;

	pos;
	quat;
	transformAux1;
	tempBtVec3_1;
	mouseCoords;
	raycaster;
	ballMaterial;

	clock = new THREE.Clock();

	initPhysics(){
		// Physics variables
		this.gravityConstant = 7.8;
		this.collisionConfiguration;
		this.dispatcher;
		this.broadphase;
		this.solver;
		this.physicsWorld;
		this.margin = 0.05;

		// Rigid bodies include all movable objects
		this.rigidBodies = [];

		this.pos = new THREE.Vector3();
		this.quat = new THREE.Quaternion();
		this.transformAux1;
		this.tempBtVec3_1;
		this.mouseCoords = new THREE.Vector2()
		this.raycaster = new THREE.Raycaster();
		this.ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );

		this.clock = new THREE.Clock();

		// Physics configuration

        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher( this.collisionConfiguration );
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration );
        this.physicsWorld.setGravity( new Ammo.btVector3( 0, -this.gravityConstant, 0 ) );

        this.transformAux1 = new Ammo.btTransform();
        this.tempBtVec3_1 = new Ammo.btVector3( 0, 0, 0 );
	}

	 createRigidBody( object, physicsShape, mass, pos, quat, vel, angVel ) {

		object.position.copy( pos );
		object.quaternion.copy( quat );

		var transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
		transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
		var motionState = new Ammo.btDefaultMotionState( transform );

		var localInertia = new Ammo.btVector3( 0, 0, 0 );
		physicsShape.calculateLocalInertia( mass, localInertia );

		var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
		var body = new Ammo.btRigidBody( rbInfo );

		object.userData.physicsBody = body;

		scene.add(object);

		if ( mass > 0 ) {

			rigidBodies.push( object );

			// Disable deactivation
			body.setActivationState( 4 );

		}

		this.physicsWorld.addRigidBody( body );

		return body;

	}

	initInput(currentScene, scenePhysics) {

        window.addEventListener( 'mousedown', function ( event ) {

            scenePhysics.mouseCoords.set(
                ( (window.innerWidth/2) / window.innerWidth ) * 2 - 1,
                - ( (window.innerHeight/2) / window.innerHeight ) * 2 + 1
            );

            scenePhysics.raycaster.setFromCamera(scenePhysics.mouseCoords, currentScene.getCamera().getCamera());

            // Creates a ball and throws it
            var ballMass = 35;
            var ballRadius = 0.4;

            var ball = new THREE.Mesh( new THREE.SphereBufferGeometry( ballRadius, 14, 10 ), scenePhysics.ballMaterial );
            ball.castShadow = true;
            ball.receiveShadow = true;
            var ballShape = new Ammo.btSphereShape( ballRadius );
            ballShape.setMargin( scenePhysics.margin );
            scenePhysics.pos.copy( scenePhysics.raycaster.ray.direction );
            scenePhysics.pos.add( scenePhysics.raycaster.ray.origin );
            scenePhysics.quat.set( 0, 0, 0, 1 );
            //var ballBody = createRigidBody( ball, ballShape, ballMass, scenePhysics.pos, scenePhysics.quat );

            


	        ball.position.copy( scenePhysics.pos );
	        ball.quaternion.copy( scenePhysics.quat );

	        var transform = new Ammo.btTransform();
	        transform.setIdentity();
	        transform.setOrigin( new Ammo.btVector3( scenePhysics.pos.x, scenePhysics.pos.y, scenePhysics.pos.z ) );
	        transform.setRotation( new Ammo.btQuaternion( scenePhysics.quat.x, scenePhysics.quat.y, scenePhysics.quat.z, scenePhysics.quat.w ) );
	        var motionState = new Ammo.btDefaultMotionState( transform );

	        var localInertia = new Ammo.btVector3( 0, 0, 0 );
	        ballShape.calculateLocalInertia( ballMass, localInertia );

	        var rbInfo = new Ammo.btRigidBodyConstructionInfo( ballMass, motionState, ballShape, localInertia );
	        var body = new Ammo.btRigidBody( rbInfo );

	        ball.userData.physicsBody = body;

	        currentScene.getScene().add( ball );

	        if ( ballMass > 0 ) {

	            scenePhysics.rigidBodies.push( ball );

	            // Disable deactivation
	            body.setActivationState( 4 );

	        }

	        scenePhysics.physicsWorld.addRigidBody( body );

            scenePhysics.pos.copy( scenePhysics.raycaster.ray.direction );
            scenePhysics.pos.multiplyScalar( 24 );
            body.setLinearVelocity( new Ammo.btVector3( scenePhysics.pos.x, scenePhysics.pos.y, scenePhysics.pos.z ) );

        }, false );
    }

    updatePhysics( deltaTime ) {

		// Step world
		this.physicsWorld.stepSimulation( deltaTime, 10 );


		// Update rigid bodies
		for ( var i = 0, il = this.rigidBodies.length; i < il; i ++ ) {

			var objThree = this.rigidBodies[ i ];
			var objPhys = objThree.userData.physicsBody;
			var ms = objPhys.getMotionState();
			if ( ms ) {

				ms.getWorldTransform( this.transformAux1 );
				var p = this.transformAux1.getOrigin();
				var q = this.transformAux1.getRotation();
				objThree.position.set( p.x(), p.y(), p.z() );
				objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

			}

		}

	}
}