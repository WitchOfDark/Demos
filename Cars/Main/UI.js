let ui_debugbox = document.getElementById("debug");

let ui_canvas = document.getElementById("mainbox");

let ui_generation = document.getElementById("generation");
let ui_cars = document.getElementById("cars");
let ui_population = document.getElementById("population");
let ui_topscores = document.getElementById("topscores");

let ui_distanceMeter = document.getElementById("distancemeter");

let ui_graphcanvas = document.getElementById("graphcanvas");
let ui_GraphCTX = ui_graphcanvas.getContext("2d");
let ui_graphheight = 200;
let ui_graphwidth = 400;

let ui_minimapcanvas = document.getElementById("minimap");
let ui_MiniMapCTX = ui_minimapcanvas.getContext("2d");
let minimapscale = 3;
let minimapfogdistance = 0;

let minimapcamera = document.getElementById("minimapcamera").style;
minimapcamera.width = 12 * minimapscale + "px";
minimapcamera.height = 6 * minimapscale + "px";

let fogdistance = document.getElementById("minimapfog").style;

let ui_graphTopArr = [];
let ui_graphTopHalfArr = [];
let ui_graphAverageArr = [];

function ui_debug(str, clear) {
	if (clear) {
		ui_debugbox.innerHTML = "";
	}
	ui_debugbox.innerHTML += str + "<br />";
}

function ui_showDistance(distance, height) {
	ui_distanceMeter.innerHTML = "<strong>Distance: </strong>" + distance + " Meters<br>";
	ui_distanceMeter.innerHTML += "<strong>Height: </strong>" + height + " Meters";
	//minimarkerdistance.left = Math.round((distance + 5) * minimapscale) + "px";
	if (distance > minimapfogdistance) {
		fogdistance.width = 800 - Math.round(distance + 15) * minimapscale + "px";
		minimapfogdistance = distance;
	}
}

function ui_setMutation(mutation) {
	gen_mutationRate = +mutation;
	console.log(gen_mutationRate);
}

function ui_setOldChampSize(clones) {
	gen_champions = +clones;
	console.log(gen_champions);
}

function ui_storeGraphScores() {
	ui_graphAverageArr.push(util_avgScore(gen_carsWithStats));
	ui_graphTopHalfArr.push(util_topHalfAvgScore(gen_carsWithStats));
	ui_graphTopArr.push(gen_carsWithStats[0].score);
}

function ui_plotGraph(arr, color) {
	let graphsize = arr.length;
	ui_GraphCTX.strokeStyle = color;
	ui_GraphCTX.beginPath();
	ui_GraphCTX.moveTo(0, 0);
	for (let i = 0; i < graphsize; i++) {
		ui_GraphCTX.lineTo(400 * (i + 1) / graphsize, arr[i]);
	}
	ui_GraphCTX.stroke();
}

function ui_plot_graphs() {
	ui_storeGraphScores();
	ui_clearGraphics();
	ui_plotGraph(ui_graphAverageArr, "blue")
	ui_plotGraph(ui_graphTopHalfArr, "green")
	ui_plotGraph(ui_graphTopArr, "red")
	ui_DisplayTopScores();
}

function ui_clearGraphics() {
	ui_graphcanvas.width = ui_graphcanvas.width;
	ui_GraphCTX.translate(0, ui_graphheight);
	ui_GraphCTX.scale(1, -1);
	ui_GraphCTX.lineWidth = 1;
	ui_GraphCTX.strokeStyle = "#888";
	ui_GraphCTX.beginPath();
	ui_GraphCTX.moveTo(0, ui_graphheight / 2);
	ui_GraphCTX.lineTo(ui_graphwidth, ui_graphheight / 2);
	ui_GraphCTX.moveTo(0, ui_graphheight / 4);
	ui_GraphCTX.lineTo(ui_graphwidth, ui_graphheight / 4);
	ui_GraphCTX.moveTo(0, ui_graphheight * 3 / 4);
	ui_GraphCTX.lineTo(ui_graphwidth, ui_graphheight * 3 / 4);
	ui_GraphCTX.stroke();
}

function ui_DisplayTopScores() {

	ui_topscores.innerHTML = "<tr>"
							+	"<th>#</th>"
							+	"<th>Score</th>"
							+	"<th>Distance</th>"
							+	"<th>MinMax</th>"
							+	"<th>Gen</th>"
							+"</tr>";

	m_genChampCarArr.sort(function (a, b) { if (a.score > b.score) { return -1 } else { return 1 } });

	for (let k = 0; k < m_genChampCarArr.length; k++) {

		ui_topscores.innerHTML += "<tr><th>" + (k + 1)
			+ "</th><th>" + Math.round(m_genChampCarArr[k].score * 100) / 100
			+ "</th><th>" + Math.round(m_genChampCarArr[k].x * 100) / 100
			+ "</th><th>" + Math.round(m_genChampCarArr[k].y2 * 100) / 100 + "/" + Math.round(m_genChampCarArr[k].y * 100) / 100
			+ "</th><th>" + util_clean(m_genChampCarArr[k].i) + "</tr>";
	}
}

function ui_Setup() {

	window.sim_confirmResetWorld = function () {

		if (confirm('Okay Join This World?')) {
			sim_resetWorld();
		} else {
			return false;
		}
	}

	window.ui_setOldChampSize = ui_setOldChampSize;
	window.ui_setMutation = ui_setMutation;
	window.sim_resetPopulation = sim_resetPopulation;
	window.Dr_toggleDisplay = Dr_toggleDisplay;

	let mmm = document.getElementsByName('minimapmarker')[0];
	let hbar = document.getElementsByName('healthbar')[0];
	for (let k = 0; k < gen_generationSize; k++) {

		// minimap markers
		let newbar = mmm.cloneNode(true);
		newbar.id = "bar" + k;
		newbar.style.paddingTop = k * 9 + "px";
		minimapholder.appendChild(newbar);

		// health bars
		let newhealth = hbar.cloneNode(true);
		newhealth.getElementsByTagName("DIV")[0].id = "health" + k;
		newhealth.car_index = k;
		document.getElementById("health").appendChild(newhealth);
	}
	mmm.parentNode.removeChild(mmm);
	hbar.parentNode.removeChild(hbar);

	window.ui_setCameraTarget = function (k) {
		m_camera_target = k;
	}
}