let Drawing_CTX = ui_canvas.getContext("2d");

function Dr_drawScreen() {
	Drawing_CTX.clearRect(0, 0, ui_canvas.width, ui_canvas.height);
	Drawing_CTX.save();
	Dr_setCameraPosition();
	Drawing_CTX.translate(200 - (m_camera_x * m_zoom), 200 + (m_camera_y * m_zoom));
	Drawing_CTX.scale(m_zoom, -m_zoom);
	Dr_drawFloor();
	ghost_draw_frame(Drawing_CTX, ghost);
	Dr_drawCars();
	Drawing_CTX.restore();
}

function Dr_minimapCamera(x, y) {
	minimapcamera.left = Math.round((2 + m_camera_x) * minimapscale) + "px";
	minimapcamera.top = Math.round((31 - m_camera_y) * minimapscale) + "px";
}

function Dr_setCameraPosition() {
	let cameraTargetPosition;
	if (m_camera_target >= 0) {
		cameraTargetPosition = gen_cars[m_camera_target].getPosition();
	} else {
		cameraTargetPosition = gen_leaderPosition;
	}

	let diff_y = m_camera_y - cameraTargetPosition.y;
	let diff_x = m_camera_x - cameraTargetPosition.x;
	m_camera_y -= m_cameraspeed * diff_y;
	m_camera_x -= m_cameraspeed * diff_x;
	Dr_minimapCamera(m_camera_x, m_camera_y);
}

function Dr_drawGhostReplay() {
	carPosition = ghost_get_position(ghost);
	m_camera_x = carPosition.x;
	m_camera_y = carPosition.y;
	Dr_minimapCamera(m_camera_x, m_camera_y);
	ui_showDistance(Math.round(carPosition.x * 100) / 100, Math.round(carPosition.y * 100) / 100);
	Drawing_CTX.clearRect(0, 0, ui_canvas.width, ui_canvas.height);
	Drawing_CTX.save();
	Drawing_CTX.translate(200 - (carPosition.x * m_zoom), 200 + (carPosition.y * m_zoom));
	Drawing_CTX.scale(m_zoom, -m_zoom);
	ghost_draw_frame(Drawing_CTX, ghost);
	ghost_move_frame(ghost);
	Dr_drawFloor();
	Drawing_CTX.restore();
}

function Dr_drawFloor() {
	Drawing_CTX.strokeStyle = "#000";
	Drawing_CTX.fillStyle = "#777";
	Drawing_CTX.lineWidth = 1 / m_zoom;
	Drawing_CTX.beginPath();

	outer_loop:
	for (let k = Math.max(0, Env_last_drawn_tile - 20); k < Env_floorTiles.length; k++) {
		let b = Env_floorTiles[k];
		for (f = b.GetFixtureList(); f; f = f.m_next) {
			let s = f.GetShape();
			let shapePosition = b.GetWorldPoint(s.m_vertices[0]).x;
			if ((shapePosition > (m_camera_x - 5)) && (shapePosition < (m_camera_x + 10))) {
				Dr_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
			}
			if (shapePosition > m_camera_x + 10) {
				Env_last_drawn_tile = k;
				break outer_loop;
			}
		}
	}
	Drawing_CTX.fill();
	Drawing_CTX.stroke();
}

function Dr_drawCars() {
	for (let k = (gen_cars.length - 1); k >= 0; k--) {
		myCar = gen_cars[k];
		if (!myCar.alive) {
			continue;
		}
		myCarPos = myCar.getPosition();

		if (myCarPos.x < (m_camera_x - 5)) {
			// too far behind, don't draw
			continue;
		}

		Drawing_CTX.strokeStyle = "#444";
		Drawing_CTX.lineWidth = 1 / m_zoom;

		let b = myCar.wheel1;
		for (f = b.GetFixtureList(); f; f = f.m_next) {
			let s = f.GetShape();
			let color = Math.round(255 - (255 * (f.m_density - car_wheelMinDensity)) / car_wheelMaxDensity).toString();
			let rgbcolor = "rgb(" + color + "," + color + "," + color + ")";
			Dr_drawCircle(b, s.m_p, s.m_radius, b.m_sweep.a, rgbcolor);
		}
		b = myCar.wheel2;
		for (f = b.GetFixtureList(); f; f = f.m_next) {
			let s = f.GetShape();
			let color = Math.round(255 - (255 * (f.m_density - car_wheelMinDensity)) / car_wheelMaxDensity).toString();
			let rgbcolor = "rgb(" + color + "," + color + "," + color + ")";
			Dr_drawCircle(b, s.m_p, s.m_radius, b.m_sweep.a, rgbcolor);
		}

		if (myCar.is_oldChamp) {
			Drawing_CTX.strokeStyle = "#44c";
			Drawing_CTX.fillStyle = "#ddf";
		} else {
			Drawing_CTX.strokeStyle = "#c44";
			Drawing_CTX.fillStyle = "#fdd";
		}

		Drawing_CTX.beginPath();
		b = myCar.chassis;
		for (f = b.GetFixtureList(); f; f = f.m_next) {
			let s = f.GetShape();
			Dr_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
		}
		Drawing_CTX.fill();
		Drawing_CTX.stroke();
	}
}

function Dr_toggleDisplay() {
	if (m_paused) {
		return;
	}
	ui_canvas.width = ui_canvas.width;
	if (m_doDraw) {
		m_doDraw = false;
		sim_stopSimulation();
		m_func_runningInterval = setInterval(sim_simulationStep, 1); // simulate 1000x per second when not drawing
	} else {
		m_doDraw = true;
		clearInterval(m_func_runningInterval);
		sim_startSimulation();
	}
}

function Dr_drawVirtualPoly(body, vtx, n_vtx) {
	// set strokestyle and fillstyle before call
	// call beginPath before call

	let p0 = body.GetWorldPoint(vtx[0]);
	Drawing_CTX.moveTo(p0.x, p0.y);
	for (let i = 1; i < n_vtx; i++) {
		p = body.GetWorldPoint(vtx[i]);
		Drawing_CTX.lineTo(p.x, p.y);
	}
	Drawing_CTX.lineTo(p0.x, p0.y);
}

function Dr_drawPoly(body, vtx, n_vtx) {
	// set strokestyle and fillstyle before call
	Drawing_CTX.beginPath();

	let p0 = body.GetWorldPoint(vtx[0]);
	Drawing_CTX.moveTo(p0.x, p0.y);
	for (let i = 1; i < n_vtx; i++) {
		p = body.GetWorldPoint(vtx[i]);
		Drawing_CTX.lineTo(p.x, p.y);
	}
	Drawing_CTX.lineTo(p0.x, p0.y);

	Drawing_CTX.fill();
	Drawing_CTX.stroke();
}

function Dr_drawCircle(body, center, radius, angle, color) {
	let p = body.GetWorldPoint(center);
	Drawing_CTX.fillStyle = color;

	Drawing_CTX.beginPath();
	Drawing_CTX.arc(p.x, p.y, radius, 0, 2 * Math.PI, true);

	Drawing_CTX.moveTo(p.x, p.y);
	Drawing_CTX.lineTo(p.x + radius * Math.cos(angle), p.y + radius * Math.sin(angle));

	Drawing_CTX.fill();
	Drawing_CTX.stroke();
}

function Dr_drawMiniMap() {
	let last_tile = null;
	let tile_position = new b2Vec2(-5, 0);
	minimapfogdistance = 0;
	fogdistance.width = "800px";
	ui_minimapcanvas.width = ui_minimapcanvas.width;
	ui_MiniMapCTX.strokeStyle = "#000";
	ui_MiniMapCTX.beginPath();
	ui_MiniMapCTX.moveTo(0, 35 * minimapscale);
	for (let k = 0; k < Env_floorTiles.length; k++) {
		last_tile = Env_floorTiles[k];
		last_fixture = last_tile.GetFixtureList();
		last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
		tile_position = last_world_coords;
		ui_MiniMapCTX.lineTo((tile_position.x + 5) * minimapscale, (-tile_position.y + 35) * minimapscale);
	}
	ui_MiniMapCTX.stroke();
}
