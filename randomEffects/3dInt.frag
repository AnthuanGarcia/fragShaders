#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define MAX_STEPS 28
//#define MAX_STEPS 128
#define MIN_DIST  0.0
#define MAX_DIST  16.0
//#define MAX_DIST  64.0
#define LIM_VAL   1E-4

#define ORTOGRAPHIC 0
#define RECT_SIZE 1.0

#define battery (-0.5*sin(0.5*u_time + 3.1416*0.5) + 0.50)
//#define battery (0.5)

mat2 rot2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, -s,
        s, c
    );

}

vec3 rotate(vec3 p, vec3 a) {

	p.yz *= rot2D(a.x);
	p.xz *= rot2D(-a.y);
	p.xy *= rot2D(a.z);

	return p;

}

/*float hash(float h) {
	return fract(sin(h) * 43758.5453123);
}

float noise(vec3 x) {
	vec3 p = floor(x);
	vec3 f = fract(x);
	f = f * f * (3.0 - 2.0 * f);

	float n = p.x + p.y * 157.0 + 113.0 * p.z;
	return mix(
			mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
					mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
			mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
					mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
}

float fbm(vec3 p) {
	float f = 0.0;
	f = 0.5000 * noise(p + u_time);
	p *= 2.01;
	f += 0.2500 * noise(p - 0.15*u_time);
	//p *= 2.02;
	//f += 0.1250 * noise(0.5*p + 0.5*u_time);

	return f;
}

float noise3D(vec3 p)
{
	return fract(sin(dot(p ,vec3(12.9898,78.233,128.852))) * 43758.5453)*2.0-1.0;
}*/

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

float fbm2(vec3 p)
{
	float f;
    f  = 0.25*simplex3D( p + 0.5*u_time ); //p = p*2.01;
    //f += 0.25000*simplex3D( p - 0.25*u_time ); p = p*2.02;
    //f += 0.12500*simplex3D( p ); p = p*2.03;
    //f += 0.06250*simplex3D( p ); p = p*2.04;
    //f += 0.03125*simplex3D( p );
	return f*0.5+0.5;
}

float noiseDist(vec3 p) {
	p = p / .7;
	return (fbm2(p) - 0.5) * 0.7;
}

float sdPlane( vec3 p, vec3 n, float h )
{
  // n must be normalized
  return dot(p,n) + h;
}

float scene(vec3 p) {

	//p.z += 0.25;

	vec2 mou = (u_mouse / u_resolution) * rot2D(radians(90.0));

	p = rotate(p, vec3(mou * 2.0*3.1416, 0));

	vec3 q = p*2.0;

	float m = 0.9*((1.0 - battery) - 0.5);
	//m = 0.45 * (1.0 - 0.3);

	float noise = noiseDist(q + 0.25*u_time);
	float sph = length(p) - 0.45;
	float plane = sdPlane(p, vec3(0, 1, 0), m) + noise;

	return max(sph, plane);

}

vec3 getNormal(vec3 p) {

	/*vec2 h = vec2(LIM_VAL, 0);

	return normalize(
		vec3(
			scene(p + h.xyy) - scene(p - h.xyy),
			scene(p + h.yxy) - scene(p - h.yxy),
			scene(p + h.yyx) - scene(p - h.yyx)
		)
	);*/	
	const float h = LIM_VAL;
	const vec2 k = vec2(1,-1);

    return normalize(
		k.xyy*scene( p + k.xyy*h ) + 
    	k.yyx*scene( p + k.yyx*h ) + 
        k.yxy*scene( p + k.yxy*h ) + 
        k.xxx*scene( p + k.xxx*h )
	);

}

float march(vec3 ro, vec3 rd) {

	float precis = 0.001;
    float h = precis*2.0;
	float md = 1.0;
	float d = MIN_DIST;

	for (int i = 0; i < MAX_STEPS; i++) {

		if( abs(h) < precis || d >= MAX_DIST )
			break;

        d += h;
		h = scene(ro + d*rd);

	}

	return d;

}

vec3 light = vec3(100, 300, 100);

vec3 shade(vec3 ro, vec3 rd, float t) {

	vec3 pos = ro + rd*t;

	vec3 n = getNormal(pos);
	vec3 viewPos = normalize(ro - pos);
	vec3 lightDir = normalize(light - pos);
	vec3 reflectDir = normalize(reflect(-lightDir, n));

	float spec = pow( max( dot(viewPos, reflectDir), 0.0 ), 64.0);
	float diff = max(dot(n, lightDir), 0.0);
	float front = max(dot(viewPos, n), 0.0);

	float kw = (1.0 + dot(n, lightDir)) * 0.35;
	float rim = (1.0 - front) * 0.35;

	//rim = pow(rim * 0.9, 4.0);

	vec3 cw, cc;

	float m = 1.0 - battery;

	//cw = vec3(0.0118, 0.5373, 0.9686);
	//cc = vec3(1.0, 0.0, 0.4353);

	cw = mix(
		vec3(0.698, 0.0118, 0.9686),
		vec3(0.0118, 0.5373, 0.9686), 
		m
	);

	cc = mix(
		vec3(0.0118, 0.5765, 0.4275),
		vec3(1.0, 0.0, 0.4353),
		m
	);

	vec3 col = mix(cw, cc, 1.0 - kw);

	/*if (front < mix(0.01, 0.0, diff)) {
		col = vec3(0);
		spec = rim = diff = 0.0;
	}*/

	return clamp(col + spec + rim + diff*0.2, 0.0, 1.0);
	//return n;

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;

	vec2 v = uv * 0.5;

	uv *= 1.5;
	uv.x *= ASPECT;

	float m = 1.0 - battery;

	vec3 col = mix(
		vec3(1),
		//vec3(0.9843, 0.5961, 0.9373),
		mix(
			vec3(0.5412, 0.5098, 0.9451),
			vec3(0.9843, 0.5961, 0.9373),
			m
		),
		uv.y *0.5 + 0.5
	);

#if ORTOGRAPHIC

	vec3 ro = vec3(RECT_SIZE*uv, -1);
	vec3 rd = vec3(0, 0, 1);

#else

	vec3 ro = vec3(0, 0, -1);
	vec3 rd = normalize(vec3(uv, 1.0));

#endif

	//if ( all(lessThanEqual(abs(uv), vec2(0.75))) ) {
	if (length(uv) < 0.6) {

		//ro = rotate(ro, r);
		//rd = rotate(rd, r);

		float t = march(ro, rd);
		float hit = step(t, MAX_DIST - LIM_VAL);

		col = mix(
			col,
			shade(ro, rd, t), // shade
			hit
		);

	}

	v *= v;
	col *= pow(1.0 - dot(v, v), 2.5);

	col = pow(col, vec3(.8))*1.;

	fragColor = vec4(col, 1);

}
