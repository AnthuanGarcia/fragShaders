#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;

    vec3 col;

    fragColor = vec4(col, 1);

}

/*
    v.rgba colores
    v.xyzw Posiciones
    v.stpq Texturas
    v[0], v[1], v[2], v[3] Lo que sea
*/

#define MOCO         vec3(0.87, 1, 0)
#define PINK_NOT_GAY vec3(1, 0, 0.5)
#define PINK_GAY     vec3(1, 0.75, 1)
#define ORANGE       vec3(0.9, 0.65, 0)

/* ---- Constants ------ */

#define PI     3.14159265
#define TWO_PI 6.283185
#define DEG2R 0.01745329

/* ---------------------- */

/* ----- Utilities ----- */

// Gamma correction
// col = 1.0 - exp( -col );
#define GLOW(r, d, i) pow(r/(d), i)
#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define CIRCLE(r, p) length(p) - abs(r)
#define CIRCLE2(r, p) step(dot(p, p), r*r)
#define SQUARE(l, p) max(p.x, p.y) - l
#define SDF_SQR(l, p) length( max(abs(p) - l, 0.0) )
#define ISO_TRI(s, l, p) max( abs(p.y) , abs( s*p.x + p.y*sign(p.x) ) ) - l // chafa
#define ROMBO(fx, fy, l, p) fx*p.x + fy*p.y - l
#define ELLIPSE(sxy, p, l) dot(p * sxy, p) - l

// abs( fract(U) - .5 ) / fwidth(U) // antialiased lines

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

float gridp(float x, float t) {

    float k = 0.5;
    float f = fract(x);
    
    return smoothstep(k - t, k, f) * (1.0 - smoothstep(k, k + t, f));
}

mat2 rot2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, -s,
        s, c
    );

}

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

float smoothNoise(vec2 st) {

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    fpos = fpos*fpos * (3.0 - 2.0 * fpos);

    float bl = noise(ipos);
    float br = noise(ipos + vec2(1, 0));
    float b  = mix(bl, br, fpos.x);
    
    float tl = noise(ipos + vec2(0, 1));
    float tr = noise(ipos + vec2(1));
    float t  = mix(tl, tr, fpos.x);

    return mix(b, t, fpos.y);

}

float randomRange (in vec2 seed, in float min, in float max) {
	return min + noise(seed) * (max - min);
}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( TWO_PI*(c*t + d) );

}

vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

float simplex3D(vec3 p)
{
	/* 1. find current tetrahedron T and it's four vertices */
	/* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
	/* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/

	/* calculate s and x */
	vec3 s = floor(p + dot(p, vec3(F3)));
	vec3 x = p - s + dot(s, vec3(G3));

	/* calculate i1 and i2 */
	vec3 e = step(vec3(0.0), x - x.yzx);
	vec3 i1 = e*(1.0 - e.zxy);
	vec3 i2 = 1.0 - e.zxy*(1.0 - e);

	/* x1, x2, x3 */
	vec3 x1 = x - i1 + G3;
	vec3 x2 = x - i2 + 2.0*G3;
	vec3 x3 = x - 1.0 + 3.0*G3;

    /* 2. find four surflets and store them in d */
    vec4 w, d;

	/* calculate surflet weights */
	w.x = dot(x, x);
	w.y = dot(x1, x1);
	w.z = dot(x2, x2);
	w.w = dot(x3, x3);

	/* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
	w = max(0.6 - w, 0.0);

	/* calculate surflet components */
	d.x = dot(random3(s), x);
	d.y = dot(random3(s + i1), x1);
	d.z = dot(random3(s + i2), x2);
	d.w = dot(random3(s + 1.0), x3);

	/* multiply d by w^4 */
	w *= w;
	w *= w;
	d *= w;

	/* 3. return the sum of the four surflets */
	return dot(d, vec4(52.0));

}

float fbm3D(vec3 p)
{
	float f;
    f  = 0.25*simplex3D( p ); //p = p*2.01;
    //f += 0.25000*simplex3D( p ); p = p*2.02;
    //f += 0.12500*simplex3D( p ); p = p*2.03;
    //f += 0.06250*simplex3D( p ); p = p*2.04;
    //f += 0.03125*simplex3D( p );
	return f*0.5+0.5;
}


/* -------------------- */
