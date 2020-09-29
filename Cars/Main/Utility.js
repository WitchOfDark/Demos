function util_clean(text) { return ('' + text).replace(/[<>]/g, '') }

///Average of score Fist half of array
function util_topHalfAvgScore(scores) {

	let sum = 0, firstHalfCount = Math.floor(scores.length / 2);

	for (let k = 0; k < firstHalfCount; k++) {
		sum += scores[k].score;
	}
	return sum / firstHalfCount;
}

///Average of score
function util_avgScore(scores) {
	let sum = 0;
	for (let k = 0; k < scores.length; k++) {
		sum += scores[k].score;
	}
	return sum / scores.length;
}

function car_hash(car_def) {
	return SHA1(JSON.stringify(car_def));
}


function Util_rotateCoord(coords, center, angle) {
	
	let newcoords = [];
	let cosAngle = Math.cos(angle);
	let sinAngle = Math.sin(angle);

	for (let i = 0; i < coords.length; i++) {
		let nc = {};
		let disX = (coords[i].x - center.x);
		let disY = (coords[i].y - center.y);

		nc.x = cosAngle * disX - sinAngle * disY + center.x;
		nc.y = sinAngle * disX + cosAngle * disY + center.y;
		newcoords.push(nc);
	}
	return newcoords;
}