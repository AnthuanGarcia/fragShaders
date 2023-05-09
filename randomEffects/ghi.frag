#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define PI 3.14159265
#define range(ii, ll, ss) for(float n = ii; n < ll; n += ss)

mat2 rot2D(float angle) {

	float c = cos(angle), s = sin(angle);
	return mat2(c, s, -s, c);

}

void main() {

	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy)/u_resolution.y;

	uv *= 3.0;

	vec3 col;

	float a = 0.3;
	float p = 1.2;
	float b = 2.0*p + 1.0;
	float g = 5.0;

	vec2 f, q, k;

	mat2 m = mat2(0.1);

	vec2 s = vec2(1);

	range(0.0, 10.0, 1.0) {

		f *= m;
		q *= m;

		s += pow(a, n) * cos(pow(b, n) * PI * uv - u_time);

		f += cos(s + uv * q);
		q += sin(s + uv) / g;

		s *= rot2D(1.0);
		g *= 1.1;

	}

	col = vec3(0.698, 0.0039, 0.1765)*(f.x + f.y + 2.0) + length(f) * 0.65;

	fragColor = vec4(col, 1);

}