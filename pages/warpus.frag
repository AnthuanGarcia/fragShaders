#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

#define PAL16 vec3(0.650, 0.500, 0.310), vec3(-0.650, 0.500, 0.600), vec3(0.333, 0.278, 0.278), vec3(0.660, 0.000, 0.667)
#define PAL10 vec3(0.500, 0.830, 0.168), vec3(-0.500, 0.400, 0.968), vec3(-0.500, 0.150, 0.000), vec3(2.000, -1.767, 0.177)
#define PAL19 vec3(0.268, 0.588, 1.388), vec3(0.718, -0.352, 1.118), vec3(0.448, 0.808, -0.572), vec3(2.718, 1.738, 3.138)

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( 6.283185*(c*t + d) );

}

mat2 rot2D(float angle) {

	float c = cos(angle), s = sin(angle);
	return mat2(c, -s, s, c);

}

void main() {

	vec2 uv = (2.0*gl_FragCoord.xy - u_resolution.xy)/u_resolution.x;

	vec3 col;

	for (float i = 1.0; i <= 8.0; i++) {
		uv.x += 0.6/i * sin(uv.y * i * 2.0 + u_time);
		uv.y += 0.3/i * cos(uv.x * i * 3.0 + u_time);
		uv *= rot2D(u_time*0.1);
	}

	col = mix(
		//palette(-uv.x / 2.0 + 0.5 + u_time*0.3, PAL16),
		mix(
			vec3(0.9686, 0.5255, 0.8353),
			vec3(1.0, 0.0, 0.4353),
			uv.y / 2.0 + 0.5
		),
		palette(uv.y / 2.0 + 0.5 + u_time*0.2, PAL10),
		clamp(uv.x * 0.5 + 0.5, 0.0, 1.0)
	);

	fragColor = vec4(col, 1);

}