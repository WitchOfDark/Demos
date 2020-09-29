var Env_floorseed;

var Env_groundPieceWidth = 1.5;
var Env_groundPieceHeight = 0.15;

var Env_floorTiles = [];
var Env_last_drawn_tile = 0;

var Env_maxFloorTiles = 200;

/*! 
*	W_createFloor() -> Env_maxFloorTiles * W_createFloorTile()
*/

function Env_createFloor() {

	Env_floorTiles = [];

	Math.seedrandom(Env_floorseed);

	for (var i = 0, last_tile_position = new b2Vec2(-5, 0); i < Env_maxFloorTiles; i++) {

		var last_tile = Env_createFloorTile(last_tile_position, (Math.random() * 3 - 1.5) * 1.5 * i / Env_maxFloorTiles);
		Env_floorTiles.push(last_tile);

		last_fixture = last_tile.GetFixtureList();
		last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
		last_tile_position = last_world_coords;
	}
}

function Env_createFloorTile(position, angle) {

	///BodyDefination
	body_def = new b2BodyDef();
	body_def.position.Set(position.x, position.y);

	///Make Shape Coords, rotate coords
	var coords = [];
	coords.push(new b2Vec2(0, 0));
	coords.push(new b2Vec2(0, -Env_groundPieceHeight));
	coords.push(new b2Vec2(Env_groundPieceWidth, -Env_groundPieceHeight));
	coords.push(new b2Vec2(Env_groundPieceWidth, 0));
	var center = new b2Vec2(0, 0);
	var newcoords = Util_rotateCoord(coords, center, angle);

	///FixtureDefination
	var fix_def = new b2FixtureDef();
	fix_def.friction = 0.5;
	fix_def.shape = new b2PolygonShape();
	fix_def.shape.SetAsArray(newcoords);

	///Create Body in world from bodyDefination
	var body = sim_World.CreateBody(body_def);
	body.CreateFixture(fix_def);
	return body;
}