#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define ASPECT u_resolution.x / u_resolution.y

#define MAX_STEPS 64
#define MIN_DIST  0.0
#define MAX_DIST  100.0
#define LIM_VAL   1E-4

#define I vec2(1, 0)

#define COL_A vec3(0.9, 0.6, 0.9)
#define COL_B vec3(0.6, 0.8, 0.9)

struct Light {

    vec3 pos;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    vec3 intensity;
    float shine;

} l, l1;

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

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

float sphereSDF(vec3 point, float radius) {

    return length(point) - radius;

}

float cubeSDF(vec3 point, float side) {

    vec3 d = abs(point) - side;
    float insideDist = min(max(d.x, max(d.y, d.z)), 0.0);
    float outsideDist = length(max(d, 0.0));

    return insideDist + outsideDist;

}

float cube(vec3 p, float side) {

	p = abs(p);
	return max(max(p.x, p.y), p.z) - side;

}

float scene(vec3 p) {

	vec3 r = vec3(u_time, u_time, 0);

	vec3 posCube = p - I.yyx;
	vec3 posSph  = p - I.yyx;

	posCube = rotate(posCube, r);

	float s = max(sphereSDF(posSph, 0.5), cube(posCube, 0.425));

	//vec3 q = mod(p, 6.0);

	return s;

}

float march(vec3 ro, vec3 rd) {

	float t = MIN_DIST;

	for (int i = 0; i < MAX_STEPS; i++) {

		float dist = scene(ro + t*rd);

		if (dist < LIM_VAL)
			return t;

		t += dist;

		if (t > MAX_DIST)
			return MAX_DIST;

	}

	return MAX_DIST;

}

vec3 getNormal(vec3 p) {

	const vec2 h = vec2(LIM_VAL, 0);

	return normalize(
		vec3(
			scene(p + h.xyy) - scene(p - h.xyy),
			scene(p + h.yxy) - scene(p - h.yxy),
			scene(p + h.yyx) - scene(p - h.yyx)
		)
	);

}

vec3 phong(inout Light l, vec3 p, vec3 eye) {

    vec3 N = getNormal(p);
    vec3 L = normalize(l.pos - p);
    vec3 V = normalize(eye - p);
    vec3 R = normalize(reflect(-L, N));

    float dotLN = dot(N, L);
    float dotRV = dot(R, V);

    if (dotLN < 0.0)
        return vec3(0);

    if (dotRV < 0.0)
        return l.intensity*l.diffuse*dotLN;

    return l.intensity * (l.diffuse*dotLN + l.specular*pow(dotRV, l.shine));

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= ASPECT;

	l.pos = vec3(cos(u_time), 0.5, sin(u_time));
	l.ambient = vec3(0.3529, 0.0, 0.1843);
	l.diffuse = vec3(1.0, 0.0, 0.5);
	l.specular = vec3(1.5);
	l.intensity = vec3(0.7);
	l.shine = 32.0;

	l1.pos = vec3(-cos(u_time), sin(u_time), 0.5);
	l1.ambient = vec3(0.0, 0.298, 0.3647);
	l1.diffuse = vec3(0.0, 0.6824, 1.0);
	l1.specular = vec3(1.5);
	l1.intensity = vec3(0.7);
	l1.shine = 28.0;

	vec3 col = vec3(0);

	vec3 ro = vec3(0, 0, 0);
	vec3 rd = normalize(vec3(uv, 1.0));

	float t = march(ro, rd);
	float hit = step(t, MAX_DIST - LIM_VAL);

	vec3 pos = ro + rd*t;

	vec3 col1 = l.ambient + phong(l, pos, ro);
	vec3 col2 = l1.ambient + phong(l1, pos, ro);

	vec2 fpos = fract(3.0*uv + vec2(u_time, 0)) - 0.5;
	float b = plot(abs(fpos.y - abs(fpos.x) + 0.5), 0.015);

	col = mix(
		mix(col, mix(COL_A, COL_B, uv.x*0.5 + 0.5), b),
		clamp(col1 + col2, 0.0, 1.0),
		hit
	);

	fragColor = vec4(col, 1);

}