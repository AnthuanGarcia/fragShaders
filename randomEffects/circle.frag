#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265358979323846
#define POINTS 4

#define BLUE vec3(0.0, 1.0, 0.5843)
#define PINK vec3(1.0, 0.6824, 0.0)

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec2 positions[POINTS];

float circle(vec2 uv, vec2 pos, float radius) {

    vec2 l = uv - pos;

    return 1.0 - smoothstep(
        radius - (radius*0.01),
        radius + (radius*0.01),
        dot(l,l)*4.0
    );

}

vec2 rotate2D(vec2 st, float angle){
    //st -= 0.5;

    st = mat2(
        cos(angle), sin(angle),
        -sin(angle),cos(angle)
    ) * st;

    //st += 0.5;

    return st;
}

void main() {

    vec2 uv  = (gl_FragCoord.xy/u_resolution) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(1);
    float angle = PI * 0.5 * u_time;
    uv *= rotate2D(uv, angle);

    positions[0] = vec2(0.08);
    positions[1] = vec2(0.16);
    positions[2] = vec2(0.32);
    positions[3] = vec2(0.64);

    for (int i = 0; i < POINTS; i++) {

        positions[i] += rotate2D(positions[i], angle);
        col -= circle(uv, positions[i], 0.05) *
        mix(BLUE, PINK, uv.x);

    }

    gl_FragColor = vec4(col, 1.0);

}