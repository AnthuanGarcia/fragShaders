#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

mat2 rot2D(float angle) {

	float c = cos(angle), s = sin(angle);
	return mat2(c, -s, s, c);

}

void main() {

	vec2 uv = (2.0*gl_FragCoord.xy - u_resolution.xy)/u_resolution.y;

	vec3 col;

	for (float i = 1.0; i <= 2.0; i++) {
		uv.x += 0.6/i * -cos(uv.y * i * 2.0 + u_time);
		uv.y += 0.2/i * sin(uv.x * i * 3.0 + u_time);
		uv *= rot2D(u_time*0.1);
	}

	float t = u_time*0.25;

	vec3 a = 0.5 * vec3(
		sin(uv.x + cos(uv.y) + t),
		cos(uv.x + uv.y + t),
		sin(sin(uv.x) + cos(uv.y) + t)
	) + 0.5;

	col = mix(
		mix(
			//vec3(1.0, 0.6824, 0.0),
			vec3(0.0275, 1.0, 0.9529),
			vec3(0.1176, 0.5294, 0.9961),
			//vec3(1.0, 0.0, 0.8314),
			uv.y / 2.0 + 0.5
		),
		mix(
			vec3(0.702, 1.0, 0.0),
			vec3(1.0, 0.6824, 0.9647),
			uv.y / 2.0 + 0.5
		),
		//vec3(0.2157, 0.0, 0.3059),
		uv.x / 2.0 + 0.5
	);

	fragColor = vec4(col, 1);

}