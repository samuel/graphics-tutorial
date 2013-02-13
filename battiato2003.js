
function analyzeYImageB2003(data, stride, width, height, noiseThreshold) {
	var o = 0;
	var n = width*height;
	var hist = new Int32Array(256);
	for(var y = 0; y < height; y++) {
		var o2 = o;
		for(var x = 0; x < width; x++) {
			hist[data[o2]]++;
			o2++;
		}
		o += stride;
	}

	// Smooth histogram with mean filter radius 3
	var total = hist[0] + hist[255];
	var sum = 0*hist[0] + 255*hist[255];
	for(var i = 1; i < 256-1; i++) {
		hist[i] = (hist[i-1] + hist[i] + hist[i+1]) / 3;
		total += hist[i];
		sum += i * hist[i];
	}
	var mean = sum / total;

	// mean absolute deviation
	var sum = 0;
	for(var i = 0; i < 256; i++) {
		sum += hist[i] * Math.abs(i - mean);
	}
	var dev = sum / total;

	var o = 0;
	var sum = 0;
	for(var y = 1; y < height-1; y++) {
		var o2 = o;
		for(var x = 1; x < width-1; x++) {
			var v = (
				-1*data[o2-stride]
				+ -1*data[o2-1]
				+ 4*data[o2]
				+ -1*data[o2+1]
				+ -1*data[o2+stride]) / 255.0;
			sum += (v >= noiseThreshold ? v : 0);
			o2++;
		}
		o += stride;
	}
	var focus = sum / n;

	return {
		"mean": mean,
		"deviation": dev,
		"contrast": dev/255.0,
		"focus": focus
	};
}

// settings = {noiseThreshold:, alpha:, visualThreshold:}
function battiato2003(imageData, segmentRows, segmentCols, settings, ctx) {
	var yImage = rgbaImageToY(imageData);
	var stride = imageData.width;

	var segmentWidth = Math.floor(imageData.width / segmentCols);
	var segmentHeight = Math.floor(imageData.height / segmentRows);

	settings = settings || {};
	var noiseThreshold = (settings.noiseThreshold == null ? 0.3 : settings.noiseThreshold);
	var contrastFocusAlpha = (settings.alpha == null ? 0.4 : settings.alpha);
	var visualThreshold = (settings.visualThreshold == null ? 0.1 : settings.visualThreshold);

	var segmentStats = new Array();
	var maxFocus = 0;
	var maxContrast = 0;
	for(var y = 0; y < segmentRows; y++) {
		for(var x = 0; x < segmentCols; x++) {
			var o = y*segmentHeight*stride + x*segmentWidth;
			var stats = analyzeYImageB2003(yImage.subarray(o, o+segmentHeight*stride),
				stride, segmentWidth, segmentHeight, noiseThreshold);
			stats.x = x;
			stats.y = y;
			maxFocus = Math.max(maxFocus, stats.focus);
			maxContrast = Math.max(maxContrast, stats.contrast);
			segmentStats.push(stats);
		}
	}
	// maxFocus = 1;
	// maxContrast = 1;

	var iSum = 0;
	var iN = 0;
	for(var i = 0; i < segmentStats.length; i++) {
		var s = segmentStats[i];
		var focus = s.focus / maxFocus;
		var contrast = s.contrast / maxContrast;
		var significance = focus + (contrast-focus)*contrastFocusAlpha;
		if (significance > visualThreshold) {
			iSum += s.mean;
			iN++;
			if (ctx) {
				ctx.strokeStyle = "rgba(255, 0, 0, 0.4)";
				ctx.strokeRect(s.x*segmentWidth, s.y*segmentHeight, segmentWidth, segmentHeight);
			}
		}
	}
	if (iN == 0) {
		return 127;
	}

	var iMean = iSum / iN;
	return iMean;
}
