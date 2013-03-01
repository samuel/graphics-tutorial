
function gen_gaussian_1d(stddev, radius) {
	var scale = 1.0 / (Math.sqrt(2*Math.PI) * stddev);
	var d2 = 2.0 * stddev * stddev;
	var size = 2*radius+1;
	var out = new Float32Array(size);
	var sum = 0.0;
	for(var i = 0; i < size; i++) {
		var x = i - radius;
		var v = scale * Math.exp(-(x*x)/d2);
		out[i] = v;
		sum += v;
	}
	for(var i = 0; i < size; i++) {
		out[i] = out[i] / sum;
	}
	return out;
}

function apply_kernel_rgba_separable(source, dest, kernel) {
	var kernelRadius = Math.floor((kernel.length - 1) / 2);

	var temp = new Uint8Array(source.width*source.height*4);
	for(var y = 0; y < source.height; y++) {
		var yo = y * source.width * 4;
		var xo = yo;
		for(var x = 0; x < source.width; x++) {
			var r = 0;
			var g = 0;
			var b = 0;
			var a = 0;
			for(var i = 0; i < kernel.length; i++) {
				var x2 = x + i - kernelRadius;
				if (x2 < 0) {
					x2 = 0;
				} else if (x2 >= source.width) {
					x2 = source.width-1;
				}
				var o = yo + x2*4;
				var k = kernel[i];
				r += source.data[o]*k;
				g += source.data[o+1]*k;
				b += source.data[o+2]*k;
				a += source.data[o+3]*k;
			}
			temp[xo] = Math.round(r);
			temp[xo+1] = Math.round(g);
			temp[xo+2] = Math.round(b);
			temp[xo+3] = Math.round(a);
			xo += 4;
		}
	}

	for(var y = 0; y < source.height; y++) {
		var yo = y * source.width * 4;
		var xo = yo;
		for(var x = 0; x < source.width; x++) {
			var r = 0;
			var g = 0;
			var b = 0;
			var a = 0;
			for(var i = 0; i < kernel.length; i++) {
				var y2 = y + i - kernelRadius;
				if (y2 < 0) {
					y2 = 0;
				} else if (y2 >= source.height) {
					y2 = source.height-1;
				}
				var o = (y2*source.width + x)*4;
				var k = kernel[i];
				r += temp[o]*k;
				g += temp[o+1]*k;
				b += temp[o+2]*k;
				a += temp[o+3]*k;
			}
			dest.data[xo] = Math.round(r);
			dest.data[xo+1] = Math.round(g);
			dest.data[xo+2] = Math.round(b);
			dest.data[xo+3] = Math.round(a);
			xo += 4;
		}
	}
}
