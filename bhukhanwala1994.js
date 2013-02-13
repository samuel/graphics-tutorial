
function analyzeYImageB1994(data, stride, width, height, k) {
	var o = 0;
	var n = width*height;
	var sum = 0;
	var hist = new Int32Array(256);
	for(var y = 0; y < height; y++) {
		var o2 = o;
		for(var x = 0; x < width; x++) {
			var yy = data[o2];
			hist[yy]++;
			sum += yy;
			o2++;
		}
		o += stride;
	}
	var mean = sum / n;

	// mean absolute deviation
	var mad = 0;
	for(var i = 0; i < 256; i++) {
		mad += hist[i] * Math.abs(i - mean);
	}
	mad /= n;
	var thresh = k * mad;

	// edge counts (horizontal, vertical)
	var ech = 0;
	var ecv = 0;
	// edge magnitudes (horizontal, vertical)
	var emh = 0;
	var emv = 0;
	var o = 0;
	for(var y = 0; y < height; y++) {
		var o2 = o;
		for(var x = 0; x < width; x++) {
			var yy = data[o2];

			if (y > 0) {
				var eh = Math.abs(yy - data[o2-stride]);
				if (eh > thresh) {
					ech += 1;
					emh += eh - thresh;
				}
			}

			if (x > 0) {
				var ev = Math.abs(yy - data[o2-1]);
				if (ev > thresh) {
					ecv += 1;
					emv += ev - thresh;
				}
			}

			o2++;
		}
		o += stride;
	}

	// normalized mean edge magnitude
	var emw = 0;
	if (ech != 0 && ecv != 0 && mad != 0) {
		emw = (emh + emv) / (ech + ecv) / mad;
	}

	return {
		"mean": mean,
		"mad": mad,
		"emw": emw,
		"ecv": ecv,
		"ech": ech
	};
}

function b1994(imageData, segmentRows, segmentCols, ctx) {
	var yImage = rgbaImageToY(imageData);
	var stride = imageData.width;

	var windowRows = 6;
	var windowCols = 6;

	var segmentWidth = Math.floor(imageData.width / segmentCols);
	var segmentHeight = Math.floor(imageData.height / segmentRows);
	var windowWidth = Math.floor(segmentWidth / windowCols);
	var windowHeight = Math.floor(segmentHeight / windowRows);
	var windowN = windowCols * windowRows;

	var k = 1.0; // [0.8,1.2]
	var alpha = 0.6; // [0.50,0.75]
	var visualThreshold = 0.35; // [0.4,0.7]

	var segmentStats = new Array();
	var maxContrast = 0;
	var maxFocus = 0;
	var maxTexture = 0;
	for(var y = 0; y < segmentRows; y++) {
		for(var x = 0; x < segmentCols; x++) {
			var windowStats = new Array();
			var mean = 0;
			var mad = 0;
			var emw = 0;
			var ecv = 0;
			var ech = 0;
			for(var y2 = 0; y2 < windowRows; y2++) {
				for(var x2 = 0; x2 < windowCols; x2++) {
					var o = (y*segmentHeight + y2*windowHeight)*stride + (x*segmentWidth + x2*windowWidth);
					var stats = analyzeYImageB1994(yImage.subarray(o, o+windowHeight*stride),
						stride, windowWidth, windowHeight, k);
					windowStats.push(stats);
					mean += stats.mean;
					mad += stats.mad;
					emw += stats.emw;
					ecv += stats.ecv;
					ech += stats.ech;
				}
			}
			var meanMean = mean / windowN;
			var meanMAD = mad / windowN;
			var meanEMW = emw / windowN;
			var meanECv = ecv / windowN;
			var meanECh = ech / windowN;
			mean = 0;
			mad = 0;
			emw = 0;
			ecv = 0;
			ech = 0;
			for(var i = 0; i < windowStats.length; i++) {
				var s = windowStats[i];
				mean += Math.abs(s.mean - meanMean);
				mad += Math.abs(s.mad - meanMAD);
				emw += Math.abs(s.emw - meanEMW);
				ecv += Math.abs(s.ecv - meanECv);
				ech += Math.abs(s.ech - meanECh);
			}
			var devMean = mean / windowN;
			var devMAD = mad / windowN;
			var devEMW = emw / windowN;
			var devECv = ecv / windowN;
			var devECh = ech / windowN;

			var contrast = meanMAD + devMean;
			var focus = meanEMW;
			var texture = 1/devMAD + 1/Math.min(devECh, devECv);

			maxContrast = Math.max(contrast, maxContrast);
			maxFocus = Math.max(focus, maxFocus);
			maxTexture = Math.max(texture, maxTexture);
			segmentStats.push({
				"contrast": contrast,
				"focus": focus,
				"texture": texture,
				"mean": meanMean,
				"x": x,
				"y": y
			});
		}
	}

	var iSum = 0;
	var iN = 0;
	for(var i = 0; i < segmentStats.length; i++) {
		var s = segmentStats[i];
		var focus = s.focus / maxFocus;
		var contrast = s.contrast / maxContrast;
		var texture = s.texture / maxTexture;
		var significance = focus * (alpha*contrast + (1-alpha)*texture);
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
