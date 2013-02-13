function detectSkin(source, dest) {
	var n = source.data.length;
	for(var o = 0; o < n; o+=4) {
		var r = source.data[o];
		var g = source.data[o+1];
		var b = source.data[o+2];

		var ycbcr = rgbToYCbCr(r, g, b);
		// if ((ycbcr.cr >= 135 && ycbcr.cr <= 165) && (ycbcr.cb >= 80 && ycbcr.cb <= 125)) {
		if (ycbcr.y > 80 && (ycbcr.cr >= 133 && ycbcr.cr <= 173) && (ycbcr.cb >= 80 && ycbcr.cb <= 120)) {
		// if ((ycbcr.cr >= 140 && ycbcr.cr <= 165) || (ycbcr.cb >= 140 && ycbcr.cb <= 195)) {
			dest.data[o] = r
			dest.data[o+1] = g;
			dest.data[o+2] = b;
			dest.data[o+3] = source.data[o+3];
		}
	}
}