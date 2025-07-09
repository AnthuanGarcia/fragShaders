#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y
#define PI 3.14159265
#define D2R 0.0174532925

mat2 rot2D(float angle) {
	float c = cos(angle), s = sin(angle);
	return mat2(c, s, -s, c);
}

void main() {

    vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
    uv.x *= ASPECT;

    uv *= 2.0;

    vec3 col = vec3(1);

    float r = 0.75;
    float circle = length(uv) - r;

    float r2 = 1.0;
    float circle2 = length(uv + 0.25) - r2;

    if (circle < 0.0) {

        float s = 1.1;
        float m = abs(circle) / r;

        col = mix(
            vec3(0.502, 0.5333, 0.8471),
            vec3(1),
            s - s*m
        );
    }

    if (circle2 < 0.0) {

        float s = 1.0;
        float m = abs(circle2) / r2;

        col = mix(
            vec3(0.9686, 0.4157, 0.4039),
            col,
            s - s*m
        );
    }


    fragColor = vec4(col, 1);

}
