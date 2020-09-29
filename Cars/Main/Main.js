let ghost;

let m_doDraw = true;
let m_paused = false;

let m_cameraspeed = 0.05;
let m_camera_y = 0;
let m_camera_x = 0;
let m_camera_target = -1; // which car should we follow? -1 = leader

let m_genChampCarArr = [];

let m_doSleep = true;

let m_zoom = window.m_zoom = 70;

let m_ghostReplayInterval = null;
let m_func_runningInterval;
let m_func_drawInterval;

function Main() {

	ui_Setup();

	Env_floorseed = Math.seedrandom();
	sim_World = new b2World(sim_gravity, m_doSleep);

	Env_createFloor();
	Dr_drawMiniMap();
	gen_generationZero();

	m_func_runningInterval 	= setInterval(sim_simulationStep, Math.round(1000 / sim_box2dfps));
	m_func_drawInterval 	= setInterval(Dr_drawScreen		, Math.round(1000 / sim_screenfps));

}

Main();