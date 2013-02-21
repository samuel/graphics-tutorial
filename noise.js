
// ratio-of-uniforms gaussian random
// http://www.cse.cuhk.edu.hk/~phwl/mt/public/archives/papers/grng_acmcs07.pdf
function gaussRandom(mu, sig) {
	var u, v, x, y, q;
	do {
		u = Math.random();
		v = 1.7156 * (Math.random() - 0.5);
		x = u - 0.449871;
		y = Math.abs(v) + 0.386595;
		q = x*x + y*(0.19600*y - 0.25472*x);
	} while (q > 0.27597 && (q > 0.27846 || v*v > -4*Math.log(u)*u*u));
	return mu + sig*v/u;
}

var gaussCache = [];
var gaussCacheI = 0;
for(var i = 0; i < 1000000; i++) {
	gaussCache[i] = gaussRandom(0, 1);
}

function cachedGaussRandom() {
	var v = gaussCache[gaussCacheI];
	gaussCacheI = (gaussCacheI + 1) % gaussCache.length;
	return v;
}

function gaussNoise(imageData, mult, alpha) {
	gaussCacheI = 0;
	var o = 0;
	for(var y = 0; y < imageData.height; y++) {
		for(var x = 0; x < imageData.width; x++) {
			var noise = Math.round(255*cachedGaussRandom()*mult);
			var v = imageData.data[o];
			imageData.data[o] = clamp(lerp(v, v+noise, alpha), 0, 255);
			v = imageData.data[o+1];
			imageData.data[o+1] = clamp(lerp(v, v+noise, alpha), 0, 255);
			v = imageData.data[o+2];
			imageData.data[o+2] = clamp(lerp(v, v+noise, alpha), 0, 255);
			o += 4;
		}
	}
}

var randomCache = [];
var randomCacheI = 0;
for(var i = 0; i < 1000000; i++) {
	randomCache[i] = Math.random();
}

function cachedRandom() {
	var v = randomCache[randomCacheI];
	randomCacheI = (randomCacheI + 1) % randomCache.length;
	return v;
}

function uniformNoise(imageData, mult, alpha) {
	randomCacheI = 0;
	var o = 0;
	for(var y = 0; y < imageData.height; y++) {
		for(var x = 0; x < imageData.width; x++) {
			var noise = Math.round(255 * (cachedRandom()*2-1) * mult);
			var v = imageData.data[o];
			imageData.data[o] = clamp(lerp(v, v+noise, alpha), 0, 255);
			v = imageData.data[o+1];
			imageData.data[o+1] = clamp(lerp(v, v+noise, alpha), 0, 255);
			v = imageData.data[o+2];
			imageData.data[o+2] = clamp(lerp(v, v+noise, alpha), 0, 255);
			o += 4;
		}
	}
}
