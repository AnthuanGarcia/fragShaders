#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define TEMP (0.5 * sin(u_time) + 0.5)

mat2 rot2D(float angle) {

	float c = cos(angle), s = sin(angle);
	return mat2(c, -s, s, c);

}

void main() {

	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy)/u_resolution.y;

	vec3 col;

	uv *= 0.5;

	for (float i = 1.0; i < 4.0; i += 0.5) {

		uv.x += 0.1/i * cos(uv.y * i * i + u_time);
		uv.y += 0.2/i * sin(uv.x * i * 12.0 + u_time);

		uv *= rot2D(u_time * 0.05);

	}

	float a = cos(uv.x - sin(uv.y) + 0.5*u_time) *0.5 + 0.5;

	vec3 baseCol = mix(
		vec3(0.5, 0.5, 1),
		vec3(1, 0.5, 0.5),
		TEMP
	);

	vec3 backCol = mix(
		vec3(1.0, 0.7137, 0.4078),
		vec3(0.7647, 0.0, 1.0),
		TEMP
	);

    /*col = mix(
        vec3(0.5, 0.5, 1),
        vec3(0.9255, 0.9804, 1.0),
        a
    );

	col = mix(
        vec3(1, 0.5, 0.5),
        vec3(1.0, 0.9255, 0.9961),
        a
    );*/

	col = mix(baseCol, backCol, a);

    /*col = mix(
        col,
        vec3(1, 0, 0.4),
        sin(uv.y + cos(uv.x) ) *0.5 + 0.5
    );*/

	fragColor = vec4(col, 1);

}