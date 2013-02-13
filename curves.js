function drawBezierCurve(ctx, points) {
	var n = points.length-1;

	var c = [];
	var l = 0;
	for(var i = 0; i <= n; i++) {
		c[i] = factorial(n) / (factorial(i) * factorial(n-i));

		if (i > 1) {
			var p0 = points[i-1];
			var p1 = points[i];
			l += Math.sqrt(Math.pow(p0[0]-p1[0], 2) + Math.pow(p0[1] - p1[1], 2));
		}
		// ctx.beginPath();
		// ctx.arc(points[i][0],points[i][1],5,0,Math.PI*2,true);
		// ctx.stroke();
	}
	var dt = 1 / l;

	ctx.beginPath();
	ctx.moveTo(points[0][0], points[0][1]);
	for(var t = 0.01; t <= 1.0; t += dt) {
		var x = 0;
		var y = 0;
		for(var i = 0; i <= n; i++) {
			var p = points[i];
			var b = c[i] * Math.pow(t, i) * Math.pow(1 - t, n - i);
			x += b * p[0];
			y += b * p[1];
		}
		console.log(x, y);
		ctx.lineTo(x, y);
	}
	ctx.stroke();
}

// http://www.fizyka.umk.pl/~jacek/docs/nrc/bookcpdf.html
// http://www.arcetri.astro.it/irlab/library/recipes/bookcpdf/c3-3.pdf
// http://oceancolor.gsfc.nasa.gov/staff/norman/seawifs_image_cookbook/faux_shuttle/spline.c

// function spline(points, yp1, ypn) {
// 	var y2 = [];
// 	var u = [1, n-1];
// 	if (yp1 > 0.99e30) {
// 		y2[0] = 0.0;
// 		u[0] = 0.0;
// 	} else {
// 		y2[0] = -0.5;
// 	}
// }

// int i,k;
// float p,qn,sig,un,*u;
// u=vector(1,n-1);
// if (yp1 > 0.99e30) The lower boundary condition is set either to be \nat-
// y2[1]=u[1]=0.0; ural"
// else { or else to have a specied rst derivative.
// y2[1] = -0.5;
// u[1]=(3.0/(x[2]-x[1]))*((y[2]-y[1])/(x[2]-x[1])-yp1);
// }
// for (i=2;i<=n-1;i++) { This is the decomposition loop of the tridiagonal al-
// gorithm. y2 and u are used for tem-
// porary storage of the decomposed
// factors.
// sig=(x[i]-x[i-1])/(x[i+1]-x[i-1]);
// p=sig*y2[i-1]+2.0;
// y2[i]=(sig-1.0)/p;
// u[i]=(y[i+1]-y[i])/(x[i+1]-x[i]) - (y[i]-y[i-1])/(x[i]-x[i-1]);
// u[i]=(6.0*u[i]/(x[i+1]-x[i-1])-sig*u[i-1])/p;
// }
// if (ypn > 0.99e30) The upper boundary condition is set either to be
// qn=un=0.0; \natural"
// else { or else to have a specied rst derivative.
// qn=0.5;
// un=(3.0/(x[n]-x[n-1]))*(ypn-(y[n]-y[n-1])/(x[n]-x[n-1]));
// }
// y2[n]=(un-qn*u[n-1])/(qn*y2[n-1]+1.0);
// for (k=n-1;k>=1;k--) This is the backsubstitution loop of the tridiagonal
// y2[k]=y2[k]*y2[k+1]+u[k]; algorithm.
// free_vector(u,1,n-1);
// }

// void splint(float xa[], float ya[], float y2a[], int n, float x, float *y)
// Given the arrays xa[1..n] and ya[1..n], which tabulate a function (with the xai's in order),
// and given the array y2a[1..n], which is the output from spline above, and given a value of
// x, this routine returns a cubic-spline interpolated value y.
// {
// void nrerror(char error_text[]);
// int klo,khi,k;
// float h,b,a;
// klo=1; We will nd the right place in the table by means of
// bisection. This is optimal if sequential calls to this
// routine are at random values of x. If sequential calls
// are in order, and closely spaced, one would do better
// to store previous values of klo and khi and test if
// they remain appropriate on the next call.
// khi=n;
// while (khi-klo > 1) {
// k=(khi+klo) >> 1;
// if (xa[k] > x) khi=k;
// else klo=k;
// } klo and khi now bracket the input value of x.
// h=xa[khi]-xa[klo];
// if (h == 0.0) nrerror("Bad xa input to routine splint"); The xa's must be dis-
// a=(xa[khi]-x)/h; tinct.
// b=(x-xa[klo])/h; Cubic spline polynomial is now evaluated.
// *y=a*ya[klo]+b*ya[khi]+((a*a*a-a)*y2a[klo]+(b*b*b-b)*y2a[khi])*(h*h)/6.0;
// }