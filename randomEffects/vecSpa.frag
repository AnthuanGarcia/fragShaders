#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define PI 3.14159265
#define DELTA PI/20.0

#define RX 1.0 / min(u_resolution.x, u_resolution.y)

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

#define ZOOM 5.0

vec2 center(vec2 pos) {
	return (floor(pos / ZOOM) + 0.5) * ZOOM;
}

void main() {

	vec2 uv = (gl_FragCoord.xy / u_resolution) - 0.5;
	uv *= ZOOM;
	uv.x *= u_resolution.x / u_resolution.y;

	vec2 fpos = fract(uv) - 0.5;
	//fpos.y -= 0.5;

	vec2 mou = ((u_mouse / u_resolution) - 0.5) * ZOOM;
	mou.x *= u_resolution.x / u_resolution.y;

	vec2 arrowCenter = center(fpos);

	vec2 n = arrowCenter - mou;

	float angle = atan(n.y, n.x) + 2.0*PI;
	float angleFract = mod(angle, DELTA);
	float angle0 = angle - angleFract;

	vec2 r = vec2(cos(angle0), sin(angle0));
	vec2 r1 = rot2D(DELTA) * r;

	fpos *= rot2D(angle0);

	vec3 col;

	col = mix(
		col,
		vec3(1),
		plot(abs(fpos.x), 0.01)
	);

	fragColor = vec4(col, 1);

}