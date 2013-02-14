// image, guide, dest: ImageData (all must be the same size)
// radius: integer
// eps: float

function guidedFilter(image, guide, dest, radius, eps) {
	var width = image.width;
	var height = image.height;

	var imageData = image.data;
	var guideData = guide.data;
	var destData = dest.data;

	var temp = new Array();
	guidedFilter_temp = temp;
	var so = 0;
	var to = 0;
	var sumI, sumP, sumIP, sumII;
	for(var y = 0; y < height; y++) {
		sumI = 0
		sumP = 0
		sumIP = 0
		sumII = 0
		for(var x = 0; x < width; x++) {
			var i = rgbToY(imageData[so], imageData[so+1], imageData[so+2]);
			var p = rgbToY(guideData[so], guideData[so+1], guideData[so+2]);

			sumI += i;
			sumP += p;
			sumIP += i * p;
			sumII += i * i;

			if (y > 0) {
				if (x > 0) {
					var s = temp[to-width-1];
					sumI -= s.sumI;
					sumP -= s.sumP;
					sumIP -= s.sumIP;
					sumII -= s.sumII;
				}
				var s = temp[to-width];
				sumI += s.sumI;
				sumP += s.sumP;
				sumIP += s.sumIP;
				sumII += s.sumII;
			}

			temp[to] = {
				"sumI": sumI,
				"sumP": sumP,
				"sumIP": sumIP,
				"sumII": sumII
			};

			so += 4;
			to++;
		}
	}

	var temp2 = new Array(); //new Float32Array(width*height*2);
	var to = 0;
	var sumI, sumP, sumIP, sumII;
	var a, b;
	var x0, y0, x1, y1;
	for(var y = 0; y < height; y++) {
		y0 = Math.max(y-radius, 0);
		y1 = Math.min(y+radius, height-1);
		a = 0.0;
		b = 0.0;
		for(var x = 0; x < width; x++) {
			x0 = Math.max(x-radius, 0);
			x1 = Math.min(x+radius, width-1);

			var s = temp[y1*width+x1];
			sumI = s.sumI
			sumP = s.sumP
			sumIP = s.sumIP
			sumII = s.sumII
			if (x0 > 0) {
				var s = temp[y1*width+x0-1];
				sumI -= s.sumI;
				sumP -= s.sumP;
				sumIP -= s.sumIP;
				sumII -= s.sumII;
			}
			if (y0 > 0) {
				var s = temp[y0*width+x1-width];
				sumI -= s.sumI;
				sumP -= s.sumP;
				sumIP -= s.sumIP;
				sumII -= s.sumII;
			}
			if (x0 > 0 && y0 > 0) {
				var s = temp[y0*width+x0-1-width];
				sumI += s.sumI;
				sumP += s.sumP;
				sumIP += s.sumIP;
				sumII += s.sumII;
			}

			var weight = (y1 - y0 + 1) * (x1 - x0 + 1);

			var meanI = sumI / weight;
			var meanP = sumP / weight;
			var meanII = sumII / weight;
			var meanIP = sumIP / weight;
			var covIP = meanIP - meanI*meanP;
			var varI = meanII - meanI*meanI;
			var a0 = covIP / (varI + eps);
			a += a0;
			b += meanP - a0*meanI;

			if (y > 0) {
				a += temp2[to-width*2];
				b += temp2[to-width*2+1];
				if (x > 0) {
					a -= temp2[to-(1+width)*2];
					b -= temp2[to-(1+width)*2+1];
				}
			}

			temp2[to] = a;
			temp2[to+1] = b;

			to += 2;
		}
	}

	var to = 0;
	for(var y = 0; y < height; y++) {
		var y0 = Math.max(y-radius, 0);
		var y1 = Math.min(y+radius, height-1);
		for(var x = 0; x < width; x++) {
			var x0 = Math.max(x-radius, 0);
			var x1 = Math.min(x+radius, width-1);

			var o = (y1*width+x1)*2;
			var a = temp2[o];
			var b = temp2[o+1];
			if (x0 > 0) {
				var o = (y1*width+x0-1)*2;
				a -= temp2[o];
				b -= temp2[o+1];
			}
			if (y0 > 0) {
				var o = (y0*width+x1-width)*2;
				a -= temp2[o];
				b -= temp2[o+1];
			}
			if (x0 > 0 && y0 > 0) {
				var o = (y0*width+x0-1-width)*2;
				a += temp2[o];
				b += temp2[o+1];
			}

			var weight = (y1 - y0 + 1) * (x1 - x0 + 1);

			// var ycbcr = rgbToYCbCr(image.data[to], image.data[to+1], image.data[to+2]);
			// var yy2 = Math.round((ycbcr.y * a + b) / weight);
			// var rgb = yCbCrToRGB(yy2, ycbcr.cb, ycbcr.cr);
			// dest.data[to] = rgb.r;
			// dest.data[to+1] = rgb.g;
			// dest.data[to+2] = rgb.b;

			var rr = imageData[to];
			var gg = imageData[to+1];
			var bb = imageData[to+2];

			var yy = rgbToY(rr, gg, bb);
			var yy2 = Math.max(0, Math.min(255, Math.round((yy * a + b) / weight)));
			yy2 /= 255.0;
			yy /= 255.0;
			// destData[to] = yy2;
			// destData[to+1] = yy2;
			// destData[to+2] = yy2;

			// destData[to] = Math.round((image.data[to] * a + b) / weight);
			// destData[to+1] = Math.round((image.data[to+1] * a + b) / weight);
			// destData[to+2] = Math.round((image.data[to+2] * a + b) / weight);

			rr /= 255;
			gg /= 255;
			bb /= 255;
			destData[to] = Math.round(255.0*saturate(0.5*(yy2/yy*(rr+yy)+rr-yy)))
			destData[to+1] = Math.round(255.0*saturate(0.5*(yy2/yy*(gg+yy)+gg-yy)))
			destData[to+2] = Math.round(255.0*saturate(0.5*(yy2/yy*(bb+yy)+bb-yy)))

			destData[to+3] = imageData[to+3];

			to += 4;
		}
	}
}

// image, guide, dest: Uint8Array (all must be the same size)
// radius: integer
// eps: float
function guidedFilter8(image, guide, dest, radius, eps, width, height) {
	var temp = new Array();
	var so = 0;
	var to = 0;
	var sumI, sumP, sumIP, sumII;
	for(var y = 0; y < height; y++) {
		sumI = 0
		sumP = 0
		sumIP = 0
		sumII = 0
		for(var x = 0; x < width; x++) {
			var i = image.data[so];

			sumI += i;
			sumP += p;
			sumIP += i * p;
			sumII += i * i;

			if (y > 0) {
				if (x > 0) {
					var s = temp[to-width-1];
					sumI -= s.sumI;
					sumP -= s.sumP;
					sumIP -= s.sumIP;
					sumII -= s.sumII;
				}
				var s = temp[to-width];
				sumI += s.sumI;
				sumP += s.sumP;
				sumIP += s.sumIP;
				sumII += s.sumII;
			}

			temp[to] = {
				"sumI": sumI,
				"sumP": sumP,
				"sumIP": sumIP,
				"sumII": sumII
			};

			so++;
			to++;
		}
	}

	var temp2 = new Array(); //new Float32Array(width*height*2);
	var to = 0;
	var sumI, sumP, sumIP, sumII;
	var a, b;
	var x0, y0, x1, y1;
	for(var y = 0; y < height; y++) {
		y0 = Math.max(y-radius, 0);
		y1 = Math.min(y+radius, height-1);
		a = 0.0;
		b = 0.0;
		for(var x = 0; x < width; x++) {
			x0 = Math.max(x-radius, 0);
			x1 = Math.min(x+radius, width-1);

			var s = temp[y1*width+x1];
			sumI = s.sumI
			sumP = s.sumP
			sumIP = s.sumIP
			sumII = s.sumII
			if (x0 > 0) {
				var s = temp[y1*width+x0-1];
				sumI -= s.sumI;
				sumP -= s.sumP;
				sumIP -= s.sumIP;
				sumII -= s.sumII;
			}
			if (y0 > 0) {
				var s = temp[y0*width+x1-width];
				sumI -= s.sumI;
				sumP -= s.sumP;
				sumIP -= s.sumIP;
				sumII -= s.sumII;
			}
			if (x0 > 0 && y0 > 0) {
				var s = temp[y0*width+x0-1-width];
				sumI += s.sumI;
				sumP += s.sumP;
				sumIP += s.sumIP;
				sumII += s.sumII;
			}

			var weight = (y1 - y0 + 1) * (x1 - x0 + 1);

			var meanI = sumI / weight;
			var meanP = sumP / weight;
			var meanIP = sumIP / weight;
			var meanII = sumII / weight;
			var covIP = meanIP - meanI*meanP;
			var varI = meanII - meanI*meanI;
			var a0 = covIP / (varI + eps);
			a += a0;
			b += meanP - a0*meanI;

			if (y > 0) {
				a += temp2[to-width*2];
				b += temp2[to-width*2+1];
				if (x > 0) {
					a -= temp2[to-(1+width)*2];
					b -= temp2[to-(1+width)*2+1];
				}
			}

			temp2[to] = a;
			temp2[to+1] = b;

			to += 2;
		}
	}
	temp = null;

	var to = 0;
	for(var y = 0; y < height; y++) {
		var y0 = Math.max(y-radius, 0);
		var y1 = Math.min(y+radius, height-1);
		for(var x = 0; x < width; x++) {
			var x0 = Math.max(x-radius, 0);
			var x1 = Math.min(x+radius, width-1);

			var o = (y1*width+x1)*2;
			var a = temp2[o];
			var b = temp2[o+1];
			if (x0 > 0) {
				var o = (y1*width+x0-1)*2;
				a -= temp2[o];
				b -= temp2[o+1];
			}
			if (y0 > 0) {
				var o = (y0*width+x1-width)*2;
				a -= temp2[o];
				b -= temp2[o+1];
			}
			if (x0 > 0 && y0 > 0) {
				var o = (y0*width+x0-1-width)*2;
				a += temp2[o];
				b += temp2[o+1];
			}

			var weight = (y1 - y0 + 1) * (x1 - x0 + 1);

			dest.data[to] = Math.round((image.data[to] * a + b) / weight);

			to++;
		}
	}
}
