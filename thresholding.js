function otsu(histogram, start, end) {
	start = start || 0;
	end = end || histogram.length;

	var total = 0;
	var sum = 0;
	for(var t = start; t < end; t++) {
		var n = histogram[t];
		total += n;
		sum += t * n;
	}

	var sumB = 0;
	var wB = 0;

	var varMax = 0.0;
	var threshold = 0;

	for(var t = start; t < end; t++) {
		wB += histogram[t];
		if (wB == 0) {
			continue;
		}

		var wF = total - wB;
		if (wF == 0) {
			break;
		}

		sumB += t * histogram[t];
		var sumF = sum - sumB;

		var varBetween = (sumB*sumB)/wB + (sumF*sumF)/wF;

		if (varBetween > varMax) {
			varMax = varBetween;
			threshold = t;
		}
	}

	return threshold;
}

function thresholdImage(imageData, threshold) {
	var n = imageData.data.length;
	for(var i = 0; i < n; i += 4) {
		var y = rgbToY(imageData.data[i], imageData.data[i+1], imageData.data[i+2]);
		if (y <= threshold) {
			y = 0;
		} else {
			y = 255;
		}
		imageData.data[i] = y;
		imageData.data[i+1] = y;
		imageData.data[i+2] = y;
	}
}

function sauvolaThresholdingImage(image, k, w) {
	var radius = Math.round(w/2);

	var width = image.width;
	var height = image.height;
	var imageData = image.data;
	var destData = image.data;

	var temp = new Array();
	var so = 0;
	var to = 0;
	var sumI, sumII;
	for(var y = 0; y < height; y++) {
		sumI = 0
		sumII = 0
		for(var x = 0; x < width; x++) {
			var i = rgbToY(imageData[so], imageData[so+1], imageData[so+2]) / 255.0;

			sumI += i;
			sumII += i * i;

			if (y > 0) {
				if (x > 0) {
					var s = temp[to-width-1];
					sumI -= s.sumI;
					sumII -= s.sumII;
				}
				var s = temp[to-width];
				sumI += s.sumI;
				sumII += s.sumII;
			}

			temp[to] = {
				"sumI": sumI,
				"sumII": sumII
			};

			so += 4;
			to++;
		}
	}

	var so = 0;
	for(var y = 0; y < height; y++) {
		var y0 = Math.max(y-radius, 0) - 1;
		var y1 = Math.min(y+radius, height-1);
		for(var x = 0; x < width; x++) {
			var x0 = Math.max(x-radius, 0) - 1;
			var x1 = Math.min(x+radius, width-1);

			var s = temp[y1*width+x1];
			var sumI = s.sumI
			var sumII = s.sumII
			if (x0 >= 0) {
				var s = temp[y1*width+x0];
				sumI -= s.sumI;
				sumII -= s.sumII;
			}
			if (y0 >= 0) {
				var s = temp[y0*width+x1];
				sumI -= s.sumI;
				sumII -= s.sumII;
			}
			if (x0 >= 0 && y0 >= 0) {
				var s = temp[y0*width+x0];
				sumI += s.sumI;
				sumII += s.sumII;
			}

			var weight = (y1 - y0) * (x1 - x0);
			var meanI = sumI / weight;
			var meanII = sumII / weight;
			var varI = meanII - meanI*meanI;

			var t = Math.round(255 * meanI * (1 + k * (varI / 0.5 - 1)) + 0.5);
			var yy = rgbToY(imageData[so], imageData[so+1], imageData[so+2]);
			if (yy <= t) {
				yy = 0;
			} else {
				yy = 255;
			}
			destData[so] = yy;
			destData[so+1] = yy;
			destData[so+2] = yy;
			destData[so+3] = imageData[so+3];

			so += 4;
		}
	}
}
