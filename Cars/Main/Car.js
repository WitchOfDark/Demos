let car_chassisMaxAxis = 1.1;
let car_chassisMinAxis = 0.1;

let car_wheelMaxRadius = 0.5;
let car_wheelMinRadius = 0.2;
let car_wheelMaxDensity = 100;
let car_wheelMinDensity = 40;

let car_velocityIndex = 0;
let car_deathSpeed = 0.1;

let car_maxHealth = sim_box2dfps * 10;
let car_health = car_maxHealth;

let car_motorSpeed = 20;

class g_Car {

	velocityIndex = 0;
	health = car_maxHealth;
	maxPosition = 0;
	maxPositiony = 0;
	minPositiony = 0;
	frames = 0;
	car_def;
	alive = true;
	is_oldChamp;
	healthBar;
	healthBarText;
	minimapmarker;
	replay;

	chassis = null;
	wheel1 = null;
	wheel2 = null;

	constructor(car_def) {
		this.velocityIndex = 0;
		this.health = car_maxHealth;
		this.maxPosition = 0;
		this.maxPositiony = 0;
		this.minPositiony = 0;
		this.frames = 0;
		this.car_def = car_def
		this.alive = true;
		this.is_oldChamp = car_def.is_oldChamp;
		this.healthBar = document.getElementById("health" + car_def.index).style;
		this.healthBarText = document.getElementById("health" + car_def.index).nextSibling.nextSibling;
		this.healthBarText.innerHTML = util_clean(car_def.index);
		this.minimapmarker = document.getElementById("bar" + car_def.index).style;

		if (this.is_oldChamp) {
			this.healthBar.backgroundColor = "#44c";
			document.getElementById("bar" + car_def.index).style.borderLeft = "1px solid #44c";
			document.getElementById("bar" + car_def.index).innerHTML = util_clean(car_def.index);
		} else {
			this.healthBar.backgroundColor = "#c44";
			document.getElementById("bar" + car_def.index).style.borderLeft = "1px solid #c44";
			document.getElementById("bar" + car_def.index).innerHTML = util_clean(car_def.index);
		}

		this.chassis = car_createChassis(car_def.vertex_list);
		this.wheel1 = car_createWheel(car_def.wheel_radius1, car_def.wheel_density1);
		this.wheel2 = car_createWheel(car_def.wheel_radius2, car_def.wheel_density2);

		let carMass = this.chassis.GetMass() + this.wheel1.GetMass() + this.wheel2.GetMass();

		let torque1 = carMass * -sim_gravity.y / car_def.wheel_radius1;
		let torque2 = carMass * -sim_gravity.y / car_def.wheel_radius2;

		let joint_def = new b2RevoluteJointDef();

		let wheelVertexCoord = this.chassis.vertex_list[car_def.wheel_vertex1];		
		joint_def.localAnchorA.Set(wheelVertexCoord.x, wheelVertexCoord.y);
		joint_def.localAnchorB.Set(0, 0);
		joint_def.maxMotorTorque = torque1;
		joint_def.motorSpeed = -car_motorSpeed;
		joint_def.enableMotor = true;
		joint_def.bodyA = this.chassis;
		joint_def.bodyB = this.wheel1;

		let joint = sim_World.CreateJoint(joint_def);

		wheelVertexCoord = this.chassis.vertex_list[car_def.wheel_vertex2];
		joint_def.localAnchorA.Set(wheelVertexCoord.x, wheelVertexCoord.y);
		joint_def.localAnchorB.Set(0, 0);
		joint_def.maxMotorTorque = torque2;
		joint_def.motorSpeed = -car_motorSpeed;
		joint_def.enableMotor = true;
		joint_def.bodyA = this.chassis;
		joint_def.bodyB = this.wheel2;

		joint = sim_World.CreateJoint(joint_def);

		this.replay = ghost_create_replay();
		ghost_add_replay_frame(this.replay, this);
	}

	getPosition() {
		return this.chassis.GetPosition();
	}

	updateStats() {

		this.frames++;

		let curPosition = this.getPosition();

		if (curPosition.y > this.maxPositiony) {
			this.maxPositiony = curPosition.y;
		}
		if (curPosition.y < this.minPositiony) {
			this.minPositiony = curPosition.y;
		}
		if (curPosition.x > this.maxPosition + 0.02) {
			this.health = car_maxHealth;
			this.maxPosition = curPosition.x;
		} else {
			if (curPosition.x > this.maxPosition) {
				this.maxPosition = curPosition.x;
			}
			if (Math.abs(this.chassis.GetLinearVelocity().x) < 0.001) {
				this.health -= 5;
			}
			this.health--;
			if (this.health <= 0) {

				this.alive = false;

				let _avgspeed = (this.maxPosition / this.frames) * sim_box2dfps;
				let _position = this.maxPosition;
				let _score = _position + _avgspeed;

				ghost_compare_to_replay(this.replay, ghost, _score);

				gen_carsWithStats.push({
					car_def: this.car_def,
					score: _score,
					avgspeed: _avgspeed,
					x: _position,
					y: this.maxPositiony,
					y2: this.minPositiony
				});

				sim_World.DestroyBody(this.chassis);
				sim_World.DestroyBody(this.wheel1);
				sim_World.DestroyBody(this.wheel2);

				this.healthBarText.innerHTML = "&#128123;";
				this.healthBar.width = "0";
			}
		}
	}
}




/*
let car_Car = function () {
	this.__constructor.apply(this, arguments);
}

car_Car.prototype.chassis = null;
car_Car.prototype.wheel1 = null;
car_Car.prototype.wheel2 = null;

car_Car.prototype.__constructor = function (car_def) {
	this.velocityIndex = 0;
	this.health = car_maxHealth;
	this.maxPosition = 0;
	this.maxPositiony = 0;
	this.minPositiony = 0;
	this.frames = 0;
	this.car_def = car_def
	this.alive = true;
	this.is_oldChamp = car_def.is_oldChamp;
	this.healthBar = document.getElementById("health" + car_def.index).style;
	this.healthBarText = document.getElementById("health" + car_def.index).nextSibling.nextSibling;
	this.healthBarText.innerHTML = util_clean(car_def.index);
	this.minimapmarker = document.getElementById("bar" + car_def.index).style;

	if (this.is_oldChamp) {
		this.healthBar.backgroundColor = "#44c";
		document.getElementById("bar" + car_def.index).style.borderLeft = "1px solid #44c";
		document.getElementById("bar" + car_def.index).innerHTML = util_clean(car_def.index);
	} else {
		this.healthBar.backgroundColor = "#c44";
		document.getElementById("bar" + car_def.index).style.borderLeft = "1px solid #c44";
		document.getElementById("bar" + car_def.index).innerHTML = util_clean(car_def.index);
	}

	this.chassis = car_createChassis(car_def.vertex_list);
	this.wheel1 = car_createWheel(car_def.wheel_radius1, car_def.wheel_density1);
	this.wheel2 = car_createWheel(car_def.wheel_radius2, car_def.wheel_density2);

	let carmass = this.chassis.GetMass() + this.wheel1.GetMass() + this.wheel2.GetMass();
	let torque1 = carmass * -sim_gravity.y / car_def.wheel_radius1;
	let torque2 = carmass * -sim_gravity.y / car_def.wheel_radius2;

	let joint_def = new b2RevoluteJointDef();
	let randvertex = this.chassis.vertex_list[car_def.wheel_vertex1];
	joint_def.localAnchorA.Set(randvertex.x, randvertex.y);
	joint_def.localAnchorB.Set(0, 0);
	joint_def.maxMotorTorque = torque1;
	joint_def.motorSpeed = -car_motorSpeed;
	joint_def.enableMotor = true;
	joint_def.bodyA = this.chassis;
	joint_def.bodyB = this.wheel1;

	let joint = sim_World.CreateJoint(joint_def);

	randvertex = this.chassis.vertex_list[car_def.wheel_vertex2];
	joint_def.localAnchorA.Set(randvertex.x, randvertex.y);
	joint_def.localAnchorB.Set(0, 0);
	joint_def.maxMotorTorque = torque2;
	joint_def.motorSpeed = -car_motorSpeed;
	joint_def.enableMotor = true;
	joint_def.bodyA = this.chassis;
	joint_def.bodyB = this.wheel2;

	joint = sim_World.CreateJoint(joint_def);

	this.replay = ghost_create_replay();
	ghost_add_replay_frame(this.replay, this);
}

car_Car.prototype.getPosition = function () {
	return this.chassis.GetPosition();
}


//cw_Car.prototype.draw = function () {
//	drawObject(this.chassis);
//	drawObject(this.wheel1);
//	drawObject(this.wheel2);
//}

car_Car.prototype.updateStats = function () {

	this.frames++;

	let curPosition = this.getPosition();

	if (curPosition.y > this.maxPositiony) {
		this.maxPositiony = curPosition.y;
	}
	if (curPosition.y < this.minPositiony) {
		this.minPositiony = curPosition.y;
	}
	if (curPosition.x > this.maxPosition + 0.02) {
		this.health = car_maxHealth;
		this.maxPosition = curPosition.x;
	} else {
		if (curPosition.x > this.maxPosition) {
			this.maxPosition = curPosition.x;
		}
		if (Math.abs(this.chassis.GetLinearVelocity().x) < 0.001) {
			this.health -= 5;
		}
		this.health--;
		if (this.health <= 0) {

			this.alive = false;

			let _avgspeed = (this.maxPosition / this.frames) * sim_box2dfps;
			let _position = this.maxPosition;
			let _score = _position + _avgspeed;

			ghost_compare_to_replay(this.replay, ghost, _score);

			gen_carsWithStats.push({
				car_def: this.car_def,
				score: _score,
				avgspeed: _avgspeed,
				x: _position,
				y: this.maxPositiony,
				y2: this.minPositiony
			});

			sim_World.DestroyBody(this.chassis);
			sim_World.DestroyBody(this.wheel1);
			sim_World.DestroyBody(this.wheel2);

			this.healthBarText.innerHTML = "&#9760;";
			this.healthBar.width = "0";
		}
	}
}
*/



///Utility Function : Add Fixture of (vertex1, vertex2, origin) to Body
function car_createChassisPart(body, vertex1, vertex2) {

	let vertex_list = [];
	vertex_list.push(vertex1);
	vertex_list.push(vertex2);
	vertex_list.push(b2Vec2.Make(0, 0));

	let fix_def = new b2FixtureDef();
	fix_def.shape = new b2PolygonShape();
	fix_def.density = 80;
	fix_def.friction = 10;
	fix_def.restitution = 0.2;
	fix_def.filter.groupIndex = -1;
	fix_def.shape.SetAsArray(vertex_list, 3);

	body.CreateFixture(fix_def);
}

///Create Chassis Body
function car_createChassis(vertex_list) {

	let body_def = new b2BodyDef();
	body_def.type = b2Body.b2_dynamicBody;
	body_def.position.Set(0.0, 4.0);

	let body = sim_World.CreateBody(body_def);

	car_createChassisPart(body, vertex_list[0], vertex_list[1]);
	car_createChassisPart(body, vertex_list[1], vertex_list[2]);
	car_createChassisPart(body, vertex_list[2], vertex_list[3]);
	car_createChassisPart(body, vertex_list[3], vertex_list[4]);
	car_createChassisPart(body, vertex_list[4], vertex_list[5]);
	car_createChassisPart(body, vertex_list[5], vertex_list[6]);
	car_createChassisPart(body, vertex_list[6], vertex_list[7]);
	car_createChassisPart(body, vertex_list[7], vertex_list[0]);

	body.vertex_list = vertex_list;

	return body;
}

///Create Wheel Body
function car_createWheel(radius, density) {

	let body_def = new b2BodyDef();
	body_def.type = b2Body.b2_dynamicBody;
	body_def.position.Set(0, 0);

	let fix_def = new b2FixtureDef();
	fix_def.shape = new b2CircleShape(radius);
	fix_def.density = density;
	fix_def.friction = 1;
	fix_def.restitution = 0.2;
	fix_def.filter.groupIndex = -1;

	let body = sim_World.CreateBody(body_def);
	body.CreateFixture(fix_def);
	return body;
}

///Remove Bad Values in Car Defination
function car_cleanCar(car_def) {
	if (car_def.wheel_radius1 > car_wheelMaxRadius)
		car_def.wheel_radius1 = car_wheelMaxRadius;
	if (car_def.wheel_radius1 < car_wheelMinRadius)
		car_def.wheel_radius1 = car_wheelMinRadius;

	if (car_def.wheel_radius2 > car_wheelMaxRadius)
		car_def.wheel_radius2 = car_wheelMaxRadius;
	if (car_def.wheel_radius2 < car_wheelMinRadius)
		car_def.wheel_radius2 = car_wheelMinRadius;

	if (car_def.wheel_density1 > car_wheelMaxDensity)
		car_def.wheel_density1 = car_wheelMaxDensity;
	if (car_def.wheel_density1 < car_wheelMinDensity)
		car_def.wheel_density1 = car_wheelMinDensity;

	if (car_def.wheel_density2 > car_wheelMaxDensity)
		car_def.wheel_density2 = car_wheelMaxDensity;
	if (car_def.wheel_density2 < car_wheelMinDensity)
		car_def.wheel_density2 = car_wheelMinDensity;

	car_def.wheel_vertex1 = Math.round(car_def.wheel_vertex1) % 8;
	car_def.wheel_vertex2 = Math.round(car_def.wheel_vertex2) % 8;

	return car_def;
}

///Utility Function
function car_rndChassisPos(x, y) {

	x *= Math.random() * car_chassisMaxAxis + car_chassisMinAxis;
	y *= Math.random() * car_chassisMaxAxis + car_chassisMinAxis;

	return new b2Vec2(x, y);
}

///Random Car Defination
function car_createRandomDef(i) {

	let car_def = { index: i };

	///Wheel radius Selection
	car_def.wheel_radius1 = Math.random() * car_wheelMaxRadius + car_wheelMinRadius;
	car_def.wheel_radius2 = Math.random() * car_wheelMaxRadius + car_wheelMinRadius;

	///Wheel density Selection
	car_def.wheel_density1 = Math.random() * car_wheelMaxDensity + car_wheelMinDensity;
	car_def.wheel_density2 = Math.random() * car_wheelMaxDensity + car_wheelMinDensity;

	///8 vertex are in between circle of radius ChassisMin and ChassisMax+ChassisMin, 4 on four axis and 4 in four quadrants
	car_def.vertex_list = [];
	car_def.vertex_list.push(car_rndChassisPos(1, 0));
	car_def.vertex_list.push(car_rndChassisPos(1, 1));
	car_def.vertex_list.push(car_rndChassisPos(0, 1));
	car_def.vertex_list.push(car_rndChassisPos(-1, 1));
	car_def.vertex_list.push(car_rndChassisPos(-1, 0));
	car_def.vertex_list.push(car_rndChassisPos(-1, -1));
	car_def.vertex_list.push(car_rndChassisPos(0, -1));
	car_def.vertex_list.push(car_rndChassisPos(1, -1));

	///Wheel Vertex Selection
	car_def.wheel_vertex1 = Math.floor(Math.random() * 8) % 8;
	car_def.wheel_vertex2 = Math.floor(Math.random() * 8) % 8;

	return car_def;
}