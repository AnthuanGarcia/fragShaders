#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define MAX_STEPS 24
//#define MAX_STEPS 128
#define MIN_DIST  0.0
#define MAX_DIST  8.0
//#define MAX_DIST  64.0
#define LIM_VAL   1E-4

#define ORTOGRAPHIC 0
#define RECT_SIZE 1.0

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

float hash(float h) {
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

float noiseDist(vec3 p) {
	p = p / .75;
	return (fbm(p) - 0.3) * .75;
}

float scene(vec3 p) {

	//p.z += 0.25;

	vec3 q = p*2.0;

	float d = noiseDist(q + 0.1*u_time);
	float s = length(p) - 0.45;

	return max(s, d);

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
	//float diff = max(dot(n, lightDir), 0.0);
	float front = dot(viewPos, n);

	float kw = (1.0 + dot(n, lightDir)) * 0.3;
	float rim = (1.0 - front) * 0.25;

	vec3 cw, cc;

	cw = vec3(0.0118, 0.5373, 0.9686);
	cc = vec3(1.0, 0.0, 0.4353);

	vec3 col = mix(cw, cc, 1.0 - kw);

	//if (front > mix(0.1, 0.01, diff)) col = vec3(0);

	return clamp(col + spec + rim, 0.0, 1.0);
	//return n;

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= ASPECT;

	vec3 col = vec3(1);

	vec3 r = vec3(0, u_time, 0);

#if ORTOGRAPHIC

	vec3 ro = vec3(RECT_SIZE*uv, -1);
	vec3 rd = vec3(0, 0, 1);

#else

	vec3 ro = vec3(0, 0, -1);
	vec3 rd = normalize(vec3(uv, 1.0));

#endif

	if ( all(lessThanEqual(abs(uv), vec2(0.75))) ) {

		ro = rotate(ro, r);
		rd = rotate(rd, r);

		float t = march(ro, rd);
		float hit = step(t, MAX_DIST - LIM_VAL);

		col = mix(
			col,
			shade(ro, rd, t), // shade
			hit
		);

	}

	fragColor = vec4(col, 1);

}