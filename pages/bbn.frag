#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ZOOM 10.0
#define RX 1.0 / min(u_resolution.x, u_resolution.y)

float aastep(float threshold, float value) {

    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);

}

mat2 rot2D(float angle, float clock) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, clock*s,
        -clock*s, c
    );

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.y - 0.5;
    vec2 xuv = uv * 10.0;
    uv *= ZOOM;

    for(float i = 0.1; i < 0.8; i += 0.2) {
        uv.x += 0.5*sin(uv.y*i*3.0 + u_time);
        uv.y -= 0.5*cos(uv.x*i*3.0 + u_time) + 0.5*sin(0.1*u_time);
        uv *= rot2D( length(uv) * 0.5 * i, sin(0.1*u_time));
    }

    //uv *= rot2D(0.15*u_time, 0.0);

    vec2 fpos = fract(uv);

    vec3 col;

    col = mix(
        mix(
            vec3(0),
            vec3(1),
            -xuv.y + 4.8
        ),
        vec3(0),
        aastep( 0.5, fpos.x)
    );

    fragColor = vec4(col, 1);

}