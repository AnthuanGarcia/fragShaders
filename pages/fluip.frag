#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define PI  3.14159265
#define D2R 0.0174532925

#define PAL6 vec3(0.530, 0.787, 0.485), vec3(0.420, 0.089, 0.758), vec3(0.133, 0.924, 0.008), vec3(4.820, 4.553, 2.869)

#define range(a, l, s) for(float i = a; i < l; i += s)

mat2 rot2D(float angle) {

	float c = cos(angle);
	float s = sin(angle);

	return mat2(
		c, -s,
		s, c
	);

}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( 2.0*PI*(c*t + d) );

}

void main() {

	vec2 uv = (gl_FragCoord.xy / u_resolution) - 0.5;
	uv.x *= u_resolution.x / u_resolution.y;

	//uv.x += u_time*0.1;

	uv *= 0.5;
	uv *= rot2D(u_time*0.05);
	
	uv.x -= 1.5;

	vec2 circle = vec2(cos(u_time), sin(u_time));

	//for (float i = 1.0; i < 6.0; i++) {
	range(1.0, 6.0, 0.5) {

		//uv.x += 0.4/i * cos(uv.y * 8.0 * i + 1.5*u_time + circle.x);
		//uv.y += 0.1/i * sin(uv.x * 9.0 * i + 1.5*u_time + circle.y);

		uv.x += 0.4/i * sin(10.0*i*uv.y + u_time + circle.x);
        uv.y += 0.1/i * cos(7.0*i*uv.x  + u_time+ circle.y);

		uv *= rot2D(u_time*0.005);

	}

	/*vec3 col = mix(
		//vec3(0.5, 0.5, 1),
		//vec3(1.0, 0.85, 1.0),
		vec3(1.0, 0.451, 0.0),
		//vec3(0.9529, 0.7608, 0.9098),
		//vec3(0.9176, 1.0, 0.0),
		//vec3(0.35, 0.35, 1),
		vec3(1.0, 0.0, 0.902),
		//vec3(0.65, 0.65, 1),
		//vec3(0.1686, 0.0, 1.0),
		cos(uv.x + sin(uv.y) + 0.5*u_time) * 0.5 + 0.5
		//cos(uv.x) * 0.5 + 0.5
	);

	col = mix(
		col,
		//vec3(0.5, 1, 0.5),
		vec3(0.0, 0.1333, 1.0),
		sin(uv.y + cos(uv.x)) * 0.5 + 0.5
		//sin(uv.y) * 0.5 + 0.5
	);*/

	vec3 col = palette(cos(uv.x + sin(uv.y) + 0.5*u_time) * 0.5 + 0.5, PAL6);

	//vec3 col = 1.0 - vec3(dot(uv, vec2(1)));

	fragColor = vec4(col, 1);

}