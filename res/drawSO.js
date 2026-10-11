/*
*	Draws stroke order of the given character on the page in the (hidden) "#strokeOrderSvgs" div.
*	String character = the given character
*	Function callback() = function that will be called after drawSO is done
*	String fontStyle = 'sans' (default) or 'kaiti'
*/
// helper function: converts stroke centerline points (medians) into clean uniform sans-serif outlines
function medianToOutlinePath(points, radius) {
	radius = radius || 38;
	if (!points || points.length === 0) return "";
	if (points.length === 1) {
		var x = points[0][0], y = points[0][1];
		return "M " + (x - radius) + " " + y + " A " + radius + " " + radius + " 0 1 0 " + (x + radius) + " " + y + " A " + radius + " " + radius + " 0 1 0 " + (x - radius) + " " + y + " Z";
	}

	var leftPts = [];
	var rightPts = [];

	for (var i = 0; i < points.length; i++) {
		var dx = 0, dy = 0;
		if (i === 0) {
			dx = points[1][0] - points[0][0];
			dy = points[1][1] - points[0][1];
		} else if (i === points.length - 1) {
			dx = points[i][0] - points[i - 1][0];
			dy = points[i][1] - points[i - 1][1];
		} else {
			dx = points[i + 1][0] - points[i - 1][0];
			dy = points[i + 1][1] - points[i - 1][1];
		}
		var len = Math.sqrt(dx * dx + dy * dy) || 1;
		var nx = -dy / len * radius;
		var ny = dx / len * radius;

		leftPts.push([Math.round(points[i][0] + nx), Math.round(points[i][1] + ny)]);
		rightPts.push([Math.round(points[i][0] - nx), Math.round(points[i][1] - ny)]);
	}

	var d = "M " + leftPts[0][0] + " " + leftPts[0][1];
	for (var j = 1; j < leftPts.length; j++) {
		d += " L " + leftPts[j][0] + " " + leftPts[j][1];
	}

	d += " A " + radius + " " + radius + " 0 0 1 " + rightPts[rightPts.length - 1][0] + " " + rightPts[rightPts.length - 1][1];

	for (var k = rightPts.length - 2; k >= 0; k--) {
		d += " L " + rightPts[k][0] + " " + rightPts[k][1];
	}

	d += " A " + radius + " " + radius + " 0 0 1 " + leftPts[0][0] + " " + leftPts[0][1] + " Z";
	return d;
}

function renderFanningStrokes(target, strokesPortion, fontStyle, mediansPortion) {
	var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.style.width  = '7px';
	svg.style.height = '7px';
	svg.style.marginRight = '3px';
	target.appendChild(svg);
	var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

	// set the transform property on the g element so the character renders at 75x75
	var transformData = HanziWriter.getScalingTransform(7,7);
	group.setAttributeNS(null, 'transform', transformData.transform);
	svg.appendChild(group);

	if (fontStyle === 'kaiti' || !mediansPortion || mediansPortion.length === 0) {
		// Traditional brushwork calligraphy strokes (from Arphic KaiTi)
		strokesPortion.forEach(function(strokePath) {
			var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttributeNS(null, 'd', strokePath);
			path.style.fill = '#000';
			group.appendChild(path);
		});
	} else {
		// Clean modern sans-serif strokes with constant stroke weight and rounded caps
		mediansPortion.forEach(function(med) {
			var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			var outlineD = medianToOutlinePath(med, 38);
			path.setAttributeNS(null, 'd', outlineD);
			path.style.fill = '#000';
			group.appendChild(path);
		});
	}
}

// main function
function drawSO(reallyDoIt, character, callback, fontStyle){
	fontStyle = fontStyle || ($('#selected-font-style').val()) || 'sans';
	if(reallyDoIt){
		HanziWriter.loadCharacterData(character, {
			charDataLoader: function(char, onComplete, onErr) {
				var encoded = encodeURIComponent(char);
				$.getJSON('/data/strokes/' + encoded + '.json')
					.done(onComplete)
					.fail(function() {
						$.getJSON('data/strokes/' + encoded + '.json')
							.done(onComplete)
							.fail(function() {
								// Last-resort fallback if local static file server is unavailable
								$.getJSON('https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/' + encoded + '.json')
									.done(onComplete)
									.fail(function() { if (onErr) onErr(); });
							});
					});
			}
		}).then(function(charData) {
			var target = document.getElementById('strokeOrderSvgs-' + character);
			if (target && charData && charData.strokes) {
				target.innerHTML = '';
				var hasMedians = (fontStyle === 'sans' && Array.isArray(charData.medians) && charData.medians.length > 0);
				for (var drawSOiterator = 0; drawSOiterator < charData.strokes.length; drawSOiterator++) {
					var strokesPortion = charData.strokes.slice(0, drawSOiterator + 1);
					var mediansPortion = hasMedians ? charData.medians.slice(0, drawSOiterator + 1) : null;
					renderFanningStrokes(target, strokesPortion, fontStyle, mediansPortion);
				}
			}
			callback();
		}).catch(function(err){
			console.warn("Could not load stroke order for " + character, err);
			callback();
		});
	} else {
		callback();
	}
}
