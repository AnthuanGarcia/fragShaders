#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

vec2 getNormal(vec2 p) {

	return normalize(p);

}

void main() {

	vec2 uv = 2.0 * (gl_FragCoord.xy / u_resolution) - 1.0;

	vec2 sun = vec2(100, 200);

	vec2 ro = vec2(0, 0);
	vec2 rd = normalize(uv);

	float circle = length(uv) - 0.5;
	vec3 col;

	if (circle < 0.0) {

		vec2 pos = ro + rd*circle;
		vec2 n = getNormal(pos);

		vec2 lightDir = normalize(sun - pos);
		float diff = max(dot(lightDir, n), 0.0);	

		vec3 ambient = vec3(0.5, 0.25, 0);
		vec3 diffuse = vec3(1, 0.5, 0) * diff;

		col = ambient + diffuse;

	}

	fragColor = vec4(col, 1);

}