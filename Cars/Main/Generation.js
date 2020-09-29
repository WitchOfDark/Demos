let gen_generationSize = 20;

let gen_champions = 4;
let gen_parentality = 0.2;
let gen_mutationRate = 0.1;
let gen_counter = 0;
let gen_carsAlive = 0;

let gen_leaderPosition = {x: 0, y: 0};

let gen_carDefs = [];
let gen_cars = [];

let gen_carsWithStats = [];

let gen_numCarAttributes = 14; // change this when genome changes
let gen_swapPoint1 = 0;
let gen_swapPoint2 = 0;

function gen_generationZero() {

    ///Push multiple car_def in car_Generation, 0 : Own, rest COMPETITOR CARS
    for (let i = 0; i < gen_generationSize; i++) {

        gen_carDefs.push(car_createRandomDef(i));
    }

    gen_counter = 0;
    gen_carsAlive = gen_generationSize;
    gen_leaderPosition = {x:0, y:0};

    gen_materializeGeneration();

    ui_generation.innerHTML = "<strong>Generations: </strong>0";
    ui_population.innerHTML = "<strong>Cars Alive: </strong>" + gen_generationSize;

    ghost = ghost_create_ghost();
}

function gen_materializeGeneration() {
    gen_cars = [];
    for (let k = 0; k < gen_generationSize; k++) {
        gen_cars.push(new g_Car(gen_carDefs[k]));
    }
}

function gen_nextGeneration() {

    let newGeneration = [];
	let newborn;
	
    gen_sortCarsByScore();

	//Push Champ of generation
	m_genChampCarArr.push({
        i: gen_counter,
        score: gen_carsWithStats[0].score,
        x: gen_carsWithStats[0].x,
        y: gen_carsWithStats[0].y,
        y2: gen_carsWithStats[0].y2
    });
	
	ui_plot_graphs();
	
    for (let i = 0; i < gen_champions; i++) {
        gen_carsWithStats[i].car_def.is_oldChamp = true;
        gen_carsWithStats[i].car_def.index = i;

        newGeneration.push(car_cleanCar(gen_carsWithStats[i].car_def));
	}
	
    for (let i = gen_champions; i < gen_generationSize; i++) {
        let parent1 = gen_getParents();
        let parent2 = parent1;

        while (parent2 == parent1) {
            parent2 = gen_getParents();
        }

        newborn = gen_makeChild(gen_carDefs[parent1], gen_carDefs[parent2]);
        newborn = gen_mutateCarDef(newborn);
        newborn.is_oldChamp = false;
        newborn.index = i;
        newGeneration.push(newborn);
    }
    gen_carsWithStats = [];
    gen_carDefs = newGeneration;
    gen_counter++;
    gen_materializeGeneration();
    gen_carsAlive = gen_generationSize;
    gen_leaderPosition = {x:0, y:0};

    ui_generation.innerHTML = "<strong>Generations: </strong>" + gen_counter;
    ui_cars.innerHTML = "";
    ui_population.innerHTML = "<strong>Cars Alive: <strong>" + gen_generationSize;
}

///Iterate over all element and if elements have common score, take only first one remove rest
function removeDuplicates(arr) {
	let u = {}, a = [];
	
    for (let i = 0, l = arr.length; i < l; ++i) {

		//console.log(u.hasOwnProperty(arr[i].score));

		if (u.hasOwnProperty(arr[i].score)) {

			continue;
		}
		a.push(arr[i]);
		u[arr[i].score] = 1;
	}
	//console.log(a.length);
	//console.log("%c " + JSON.stringify(u),'background: #222; color: #bada55');
	return a;
}

///Descending Sort gen_carArr and removeDuplicates
function gen_sortCarsByScore() {
	let ret = [];
	//Descending Sort according to score
    gen_carsWithStats.sort(function(a, b) {
        if (a.score > b.score) {
            return -1
        } else {
            return 1
        }
    });
	gen_carsWithStats = removeDuplicates(gen_carsWithStats);
    for (let i = 0; i < gen_generationSize; i++) {
        ret.push(gen_carsWithStats[i]);
	}
    return ret;
}

///🥓 :Return Any 1 parent in generation
function gen_getParents() {
    let parentIndex = -1;
    for (let i = 0; i < gen_generationSize; i++) {
        if (Math.random() <= gen_parentality) {
            parentIndex = i;
            break;
        }
    }
    if (parentIndex == -1) {
        parentIndex = Math.round(Math.random() * (gen_generationSize - 1));
    }
    return parentIndex;
}

///Returns CarDef: [---CarDef1 till SwapPoint1---)[---CarDef2 till SwapPoint2---)[---CarDef1 till End---]
function gen_makeChild(car_def1, car_def2) {

    let newCarDef = {};
 
	///Two Distinct Swap Points
	gen_swapPoint1 = Math.round(Math.random() * (gen_numCarAttributes - 1));
    gen_swapPoint2 = gen_swapPoint1;
	while (gen_swapPoint2 == gen_swapPoint1) {
        gen_swapPoint2 = Math.round(Math.random() * (gen_numCarAttributes - 1));
	}
	
    let parents = [car_def1, car_def2];
    let curparent = 0;

    curparent = gen_swapParent(curparent, 0);
    newCarDef.wheel_radius1 = parents[curparent].wheel_radius1;
    curparent = gen_swapParent(curparent, 1);
    newCarDef.wheel_radius2 = parents[curparent].wheel_radius2;

    curparent = gen_swapParent(curparent, 2);
    newCarDef.wheel_vertex1 = parents[curparent].wheel_vertex1;
    curparent = gen_swapParent(curparent, 3);
    newCarDef.wheel_vertex2 = parents[curparent].wheel_vertex2;

    newCarDef.vertex_list = [];
    curparent = gen_swapParent(curparent, 4);
    newCarDef.vertex_list[0] = parents[curparent].vertex_list[0];
    curparent = gen_swapParent(curparent, 5);
    newCarDef.vertex_list[1] = parents[curparent].vertex_list[1];
    curparent = gen_swapParent(curparent, 6);
    newCarDef.vertex_list[2] = parents[curparent].vertex_list[2];
    curparent = gen_swapParent(curparent, 7);
    newCarDef.vertex_list[3] = parents[curparent].vertex_list[3];
    curparent = gen_swapParent(curparent, 8);
    newCarDef.vertex_list[4] = parents[curparent].vertex_list[4];
    curparent = gen_swapParent(curparent, 9);
    newCarDef.vertex_list[5] = parents[curparent].vertex_list[5];
    curparent = gen_swapParent(curparent, 10);
    newCarDef.vertex_list[6] = parents[curparent].vertex_list[6];
    curparent = gen_swapParent(curparent, 11);
    newCarDef.vertex_list[7] = parents[curparent].vertex_list[7];

    curparent = gen_swapParent(curparent, 12);
    newCarDef.wheel_density1 = parents[curparent].wheel_density1;
    curparent = gen_swapParent(curparent, 13);
    newCarDef.wheel_density2 = parents[curparent].wheel_density2;

    return newCarDef;
}

///If SwapPoint reached, swap parents
function gen_swapParent(curparent, attributeIndex) {
    let ret;
    if ((gen_swapPoint1 == attributeIndex) || (gen_swapPoint2 == attributeIndex)) {
        if (curparent == 1) {
            ret = 0;
        } else {
            ret = 1;
        }
    } else {
        ret = curparent;
    }
    return ret;
}

///Mutate parameter if random less that mutation rate
function gen_mutateCarDef(car_def) {

    if (Math.random() < gen_mutationRate) car_def.wheel_radius1 = Math.random() * car_wheelMaxRadius + car_wheelMinRadius;
    if (Math.random() < gen_mutationRate) car_def.wheel_radius2 = Math.random() * car_wheelMaxRadius + car_wheelMinRadius;
	
	if (Math.random() < gen_mutationRate) car_def.wheel_density1 = Math.random() * car_wheelMaxDensity + car_wheelMinDensity;
    if (Math.random() < gen_mutationRate) car_def.wheel_density2 = Math.random() * car_wheelMaxDensity + car_wheelMinDensity;

    if (Math.random() < gen_mutationRate) car_def.vertex_list.splice(0, 1, car_rndChassisPos(1,0));
    if (Math.random() < gen_mutationRate) car_def.vertex_list.splice(1, 1, car_rndChassisPos(1,1));
    if (Math.random() < gen_mutationRate) car_def.vertex_list.splice(2, 1, car_rndChassisPos(0,1));
    if (Math.random() < gen_mutationRate) car_def.vertex_list.splice(3, 1, car_rndChassisPos(-1,1));
    if (Math.random() < gen_mutationRate) car_def.vertex_list.splice(4, 1, car_rndChassisPos(-1,0));
    if (Math.random() < gen_mutationRate) car_def.vertex_list.splice(5, 1, car_rndChassisPos(-1,-1));
    if (Math.random() < gen_mutationRate) car_def.vertex_list.splice(6, 1, car_rndChassisPos(0,-1));
    if (Math.random() < gen_mutationRate) car_def.vertex_list.splice(7, 1, car_rndChassisPos(1,-1));

	if (Math.random() < gen_mutationRate) car_def.wheel_vertex1 = Math.floor(Math.random() * 8) % 8;
    if (Math.random() < gen_mutationRate) car_def.wheel_vertex2 = Math.floor(Math.random() * 8) % 8;

	return car_def;
}
