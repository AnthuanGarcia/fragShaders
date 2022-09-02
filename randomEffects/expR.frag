#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define MAX_STEPS 64
#define MIN_DIST  0.0
#define MAX_DIST  16.0
#define LIM_VAL   1E-4

#define ORTOGRAPHIC 0
#define RECT_SIZE 9.0

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

float sphere(vec3 p, float r) {

	return length(p) - r;

}

float cube(vec3 p, float l) {

	p = abs(p);
	return max(p.x, max(p.y, p.z)) - l;

}

float displace(vec3 p) {

	return 3.5*sin(u_time)*(sin(.5*p.x)*sin(.5*p.y)*sin(.5*p.z));

}

float scene(vec3 p) {

	vec3 c = vec3(4, 4, 4);

	p = rotate(p, vec3(0, u_time, 0));

	vec3 q = mod(p + 0.5*c, c) - 0.5*c;

	float cube = cube(q, 0.65);

	return cube + displace(q);

}

vec3 getNormal(vec3 p) {

	vec2 h = vec2(LIM_VAL, 0);

	return normalize(
		vec3(
			scene(p + h.xyy) - scene(p - h.xyy),
			scene(p + h.yxy) - scene(p - h.yxy),
			scene(p + h.yyx) - scene(p - h.yyx)
		)
	);

}

float march(vec3 ro, vec3 rd) {

	float precis = 0.001;
    float h = precis*2.0;
	float d = MIN_DIST;

	for (int i = 0; i < MAX_STEPS; i++) {

		if( abs(h) < precis || d >= MAX_DIST )
			break;

        d += h;
		h = scene(ro + d*rd);

	}

	return d;

}

vec3 shade(vec3 pos) {

	vec3 n = getNormal(pos);
	vec3 lightDir = normalize(vec3(1, 2, -2.0) - pos);

	float diff = max(dot(n, lightDir), 0.0);
	vec3 diffuse = diff * vec3(1.0, 0.4, 0.0);

	return vec3(0.6, 0.3, 0.0) + diffuse;

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= ASPECT;

	vec3 col = vec3(1);

#if ORTOGRAPHIC

	vec3 ro = vec3(RECT_SIZE*uv, -2);
	vec3 rd = vec3(0, 0, 1);

#else

	vec3 ro = vec3(0, 0, -2);
	vec3 rd = normalize(vec3(uv, 1.0));

#endif

	float t = march(ro, rd);
	float hit = step(t, MAX_DIST - LIM_VAL);

	col = mix(
		col,
		shade(ro + rd*t), // shade
		hit
	);

	fragColor = vec4(col, 1);

}