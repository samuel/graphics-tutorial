function identityLUT() {
	var lut = new Uint8Array(256);
	for(var i = 0; i < 256; i++) {
		lut[i] = i;
	}
	return lut;
}

function factorial(n) {
	var v = 1;
	for(var i = n; i > 1; i--) {
		v *= i;
	}
	return v;
}

function clamp(val, min, max) {
	return Math.max(Math.min(val, max), min);
}

function saturate(val) {
	return Math.max(Math.min(val, 1.0), 0.0);
}

function step(v, a, b) {
	return (v - a) / (b - a);
}

function rgbToLuminance(r, g, b) {
	return Math.round((Math.max(r, g, b) + Math.min(r, g, b)) / 2);
}

function rgbToY(r, g, b) {
	return Math.round(0.2990*r + 0.5870*g + 0.1140*b);
}

// function rgbToY(r, g, b) {
// 	var y = (19595*r + 38470*g + 7471*b + (1<<15)) >> 16;
// 	if (y > 255)
// 		y = 255;
// 	return y;
// }

// source: ImageData
// return Uint8ClampedArray
function rgbaImageToY(source) {
	var dest = new Uint8ClampedArray(source.width*source.height);
	var n = source.width*source.height;
	var data = source.data;
	var so = 0;
	for(var i = 0; i < n; i++) {
		dest[i] = rgbToY(data[so], data[so+1], data[so+2]);
		so += 4;
	}
	return dest;
}

function rgbToYCbCr(r, g, b) {
	return {
		"y": Math.round(0.2990*r + 0.5870*g + 0.1140*b),
		"cb": Math.round(-0.1687*r - 0.3313*g + 0.5000*b + 128),
		"cr": Math.round(0.5000*r - 0.4187*g - 0.0813*b + 128)
	};
}

function yCbCrToRGB(y, cb, cr) {
	return {
		"r": Math.round(y + 1.40200*(cr-128)),
		"g": Math.round(y - 0.34414*(cb-128) - 0.71414*(cr-128)),
		"b": Math.round(y + 1.77200*(cb-128))
	};
}
