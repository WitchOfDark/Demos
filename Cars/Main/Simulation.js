let sim_timeStep = 1.0 / 60.0;

let sim_box2dfps = 60;
let sim_screenfps = 60;

let sim_gravity = new b2Vec2(0.0, -9.81);

let sim_World;

function sim_simulationStep() {

	sim_World.Step(sim_timeStep, 20, 20);
	ghost_move_frame(ghost);

	for (let i = 0; i < gen_generationSize; i++) {

		if (gen_cars[i].alive) {

			ghost_add_replay_frame(gen_cars[i].replay, gen_cars[i]);

			position = gen_cars[i].getPosition();
			gen_cars[i].minimapmarker.left = Math.round((position.x + 5) * minimapscale) + "px";
			gen_cars[i].healthBar.width = Math.round((gen_cars[i].health / car_maxHealth) * 100) + "%";
			
			gen_cars[i].updateStats();
			
			if (!gen_cars[i].alive) {
				gen_carsAlive--;
				ui_population.innerHTML = "<strong>Cars Alive: </strong>" + gen_carsAlive;
				if (gen_carsAlive <= 0) {
					sim_newRound();
				}
				if (gen_leaderPosition.leader == i) {
					// leader is dead, find new leader
					sim_findLeader();
				}
				continue;
			}
			if (position.x > gen_leaderPosition.x) {
				gen_leaderPosition = position;
				gen_leaderPosition.leader = i;
			}	
		}
	}
	ui_showDistance(Math.round(gen_leaderPosition.x * 100) / 100, Math.round(gen_leaderPosition.y * 100) / 100);
}

///Find last car alive
function sim_findLeader() {

	for (let i = 0; i < gen_cars.length; i++) {

		if (gen_cars[i].alive) {
			gen_leaderPosition = gen_cars[i].getPosition();
			gen_leaderPosition.leader = i;
			console.log(gen_counter + "  gen lead : " + JSON.stringify(gen_leaderPosition));
		}
	}
}

function sim_newRound() {
	//  cw_stopSimulation();
	//   for (b = world.m_bodyList; b; b = b.m_next) {
	//     world.DestroyBody(b);
	//   }
	//   // world = new b2World(gravity, doSleep);
	//   cw_createFloor();
	gen_nextGeneration();
	ghost_reset_ghost(ghost);
	m_camera_x = m_camera_y = 0;
	ui_setCameraTarget(-1);
	//  cw_startSimulation();
}

function sim_startSimulation() {
	m_func_runningInterval = setInterval(sim_simulationStep, Math.round(1000 / sim_box2dfps));
	m_func_drawInterval = setInterval(Dr_drawScreen, Math.round(1000 / sim_screenfps));
}

function sim_stopSimulation() {
	clearInterval(m_func_runningInterval);
	clearInterval(m_func_drawInterval);
}

/*
function sim_kill() {
	let _avgspeed = (myCar.maxPosition / myCar.frames) * sim_box2dfps;
	let position = myCar.maxPosition;
	let _score = position + _avgspeed;
	ui_cars.innerHTML += Math.round(position * 100) / 100 + "m + " + " " + Math.round(_avgspeed * 100) / 100 + " m/s = " + Math.round(_score * 100) / 100 + "pts<br />";
	ghost_compare_to_replay(replay, ghost, _score);
	gen_carsWithStats.push({ i: current_car_index, v: _score, avgspeed: _avgspeed, x: position, y: myCar.maxPositiony, y2: myCar.minPositiony });
	current_car_index++;
	if (current_car_index >= gen_generationSize) {
		gen_nextGeneration();
		current_car_index = 0;
	}
	m_last_drawn_tile = 0;
}
*/

function sim_resetPopulation() {

	ui_generation.innerHTML = "";
	ui_cars.innerHTML = "";
	ui_topscores.innerHTML = "";

	ui_clearGraphics();
	gen_cars = [];
	gen_carDefs = [];
	gen_carsWithStats = [];
	m_genChampCarArr = [];

	ui_graphTopArr = [];
	ui_graphTopHalfArr = [];
	ui_graphAverageArr = [];

	lastmax = 0;
	lastaverage = 0;
	lasteliteaverage = 0;
	gen_swapPoint1 = 0;
	gen_swapPoint2 = 0;

	gen_generationZero();
}

function sim_resetWorld() {

	Env_floorseed = document.getElementById("newseed").value;

	sim_stopSimulation();
	for (b = sim_World.m_bodyList; b; b = b.m_next) {
		sim_World.DestroyBody(b);
	}

	Math.seedrandom(Env_floorseed);
	Env_createFloor();
	Dr_drawMiniMap();
	Math.seedrandom();
	sim_resetPopulation();
	sim_startSimulation();
}


///Ghost Replay

function sim_pauseSimulation() {
	m_paused = true;
	clearInterval(m_func_runningInterval);
	clearInterval(m_func_drawInterval);
	old_last_drawn_tile = m_last_drawn_tile;
	m_last_drawn_tile = 0;
	ghost_pause(ghost);
}

function sim_resumeSimulation() {
	m_paused = false;
	ghost_resume(ghost);
	m_last_drawn_tile = old_last_drawn_tile;
	m_func_runningInterval = setInterval(sim_simulationStep, Math.round(1000 / sim_box2dfps));
	m_func_drawInterval = setInterval(Dr_drawScreen, Math.round(1000 / sim_screenfps));
}

function sim_startGhostReplay() {
	if (!m_doDraw) {
		Dr_toggleDisplay();
	}
	sim_pauseSimulation();
	m_ghostReplayInterval = setInterval(Dr_drawGhostReplay, Math.round(1000 / sim_screenfps));
}

function sim_stopGhostReplay() {
	clearInterval(m_ghostReplayInterval);
	m_ghostReplayInterval = null;
	sim_findLeader();
	m_camera_x = gen_leaderPosition.x;
	m_camera_y = gen_leaderPosition.y;
	sim_resumeSimulation();
}

function sim_toggleGhostReplay(button) {
	if (m_ghostReplayInterval == null) {
		sim_startGhostReplay();
		button.value = "Resume simulation";
	} else {
		sim_stopGhostReplay();
		button.value = "View top replay";
	}
}