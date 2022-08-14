#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define WAVE_SPEED 10.0
#define STRENGTH   0.04
#define FREQUENCY  20.0

float gridp(float x, float t) {

    float k = 0.5;
    float f = fract(x);
    
    return smoothstep(k - t, k, f) * (1.0 - smoothstep(k, k + t, f));
}

#if defined(BUFFER_0)

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution;
	uv *= 6.0;
	uv.x *= ASPECT;

	vec3 col = vec3(0, 0, 1);

	uv *= mat2(
		1, 0.5,
		0, 1
	);

	col += gridp(uv.y, 0.05) + gridp(uv.x, 0.05);

	fragColor = vec4(col, 1);

}

#else

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution;

	vec2 center = u_mouse / u_resolution;

	float modTime = u_time * WAVE_SPEED;

	vec2 distVec = uv - center;
	distVec.x *= ASPECT;

	float dist = length(distVec);

	float mul = (dist - 1.0)*(dist - 1.0);
	uv += cos(FREQUENCY*dist - modTime) * STRENGTH * mul;

	vec3 col = texture(u_buffer0, uv).rgb;

	fragColor = vec4(col, 1);

}


#endif