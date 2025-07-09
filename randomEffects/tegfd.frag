#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define GLOW(r, d, i) pow(r/(d), i)
#define RX (1.0 / min(u_resolution.x, u_resolution.y))
#define ZOOM 5.5
#define D2R 0.01745

#define PAL16 vec3(0.650, 0.500, 0.310), vec3(-0.650, 0.500, 0.600), vec3(0.333, 0.278, 0.278), vec3(0.660, 0.000, 0.667)
#define PAL17 vec3(0.473, 0.552, 0.926), vec3(0.266, 0.846, 0.069), vec3(0.982, 0.604, 0.789), vec3(2.533, 5.941, 4.185)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * ZOOM, t + RX * ZOOM, p);

}

float aastep(float threshold, float value) {

    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);

}

mat2 rot2D(float angle) {

	float s = sin(angle), c = cos(angle);
	return mat2(c, -s, s, c);

}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( 6.283185*(c*t + d) );

}

void main() {

	vec2 uv = (2.0*gl_FragCoord.xy - u_resolution) / min(u_resolution.x, u_resolution.y);
	vec2 xuv = gl_FragCoord.xy / u_resolution;

	uv *= 5.0;

	uv *= rot2D(length(uv) * 0.05);
	uv *= rot2D(45.0 * D2R);

	vec3 col = vec3(1.0, 1.0, 1.0);
	vec3 p = vec3(uv, sin(uv.y + u_time));

	for (float i = 0.01; i <= 0.15; i += 0.01) {

		p.xy *= rot2D(.01);

		p.z += sin(2.0*p.y * i);

		p.x += 0.17 * sin(p.y + p.z - u_time);
		p.y *= 0.17 * cos(p.x + p.z - u_time);

		col = mix(
			col,
			palette(xuv.x - 2.9, PAL16) * 1.6,
			GLOW(0.015, abs(length(p) - 1.5), 1.1)
			//aastep(abs(length(p) - 1.5), 0.02)
		);

	}

	fragColor = vec4(col, 1);

}