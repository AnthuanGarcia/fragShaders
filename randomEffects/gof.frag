#version 300 es

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_buffer0;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define PAL10 vec3(0.500, 0.830, 0.168), vec3(-0.500, 0.400, 0.968), vec3(-0.500, 0.150, 0.000), vec3(2.000, -1.767, 0.177)

float get(float x, float y) {
    vec2 uv = (gl_FragCoord.xy + vec2(x, y)) / u_resolution;
    return texture(u_buffer0, uv).r;
}

float oneIfZero(float value) {
    return step(abs(value), 0.1);
}

vec3 evaluate(float sum) {
    float has3 = oneIfZero(sum - 3.0);
    float has2 = oneIfZero(sum - 2.0);
    // a cell is (or becomes) alive if it has 3 neighbors
    // or if it has 2 neighbors *and* was alive already
    return vec3(has3 + has2 * get(0.0, 0.0));
}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( 6.283185*(c*t + d) );

}

#if defined(BUFFER_0)

void main() {
    float sum =
        get(-1.0, -1.0) +
        get(-1.0, 0.0) +
        get(-1.0, 1.0) +
        get(0.0, -1.0) +
        get(0.0, 1.0) +
        get(1.0, -1.0) +
        get(1.0, 0.0) +
        get(1.0, 1.0);

    float tap = min(u_resolution.x, u_resolution.y) * 0.01;

    if (distance(u_mouse, gl_FragCoord.xy) < tap) {
        sum = 3.0;
    }

    fragColor = vec4(evaluate(sum), 1.0);

}

#else

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    float sum =
        get(-1.0, -1.0) +
        get(-1.0, 0.0) +
        get(-1.0, 1.0) +
        get(0.0, -1.0) +
        get(0.0, 1.0) +
        get(1.0, -1.0) +
        get(1.0, 0.0) +
        get(1.0, 1.0);

    float tap = min(u_resolution.x, u_resolution.y) * 0.01;

    if (distance(u_mouse, gl_FragCoord.xy) < tap) {
        sum = 3.0;
    }

    vec3 aux = mix(
        vec3(0),
        palette(uv.y + u_time, PAL10),
        evaluate(sum)
    );

    fragColor = vec4(aux, 1.0);

}

#endif