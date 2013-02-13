function calculateHistogram(imageData) {
	var histogram = new Float32Array(256);
	var n = imageData.data.length;
	var total = 0;
	for(var i = 0; i < n; i += 4) {
		var r = imageData.data[i];
		var g = imageData.data[i+1];
		var b = imageData.data[i+2];
		var l = rgbToY(r, g, b);
		histogram[l]++;
		total++;
	}
	for(var l = 0; l < 256; l++) {
		histogram[l] /= total;
	}
	return histogram;
}

function analyzeHistogram(histogram, pct) {
	var n = histogram.length;

	var min = 0;
	var s = 0.0;
	for(var l = 0; l < n; l++) {
		s += histogram[l];
		if (s >= pct) {
			min = l;
			break;
		}
	}
	var max = n-1;
	var s = 0.0;
	for(var l = n-1; l >= 0; l--) {
		s += histogram[l];
		if (s >= pct) {
			max = l;
			break
		}
	}
	var sum = 0;
	for(var l = 0; l < n; l++) {
		sum += l * histogram[l];
	}
	var mean = sum / 255.0;

	return {
		"min": min / 255.0,
		"max": max / 255.0,
		"mean": mean,
		"gamma": Math.log(0.5) / Math.log(mean),
	};
}
