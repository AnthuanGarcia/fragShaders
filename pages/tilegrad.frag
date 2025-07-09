#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define TWO_PI 6.283185
#define ZOOM 5.0
#define RX 1.0 / min(u_resolution.x, u_resolution.y)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (0.5 + ZOOM), t + RX * (0.5 + ZOOM), p);

}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( TWO_PI*(c*t + d) );

}

float noise(vec2 st) {

    return fract(
        sin(
            dot(
                st.xy,
                vec2(12.9898,78.233)
            )
        ) * 43758.5453123
    );

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.y;
    uv *= ZOOM;

    vec3 col;

    uv *= mat2(
        1, uv.x,
        -uv.x, 1
    );
    uv.x += 0.25*u_time;

    vec2 ipos = floor(uv);
    vec2 fpos = fract(uv);
    float id = noise(ipos);
    float ton = sin(u_time) * step(0.8, id) + step(-0.8, -id);

    vec3 a, b, c, d;
    
    a = vec3(
        noise(ipos + 2.0),
        noise(ipos - 4.0),
        noise(ipos * 6.0)
    );

    b = vec3(
        noise(ipos + 1.0),
        noise(ipos - 3.0),
        noise(ipos * 5.0)
    ) * ton;

    c = vec3(
        noise(ipos + 8.0),
        noise(ipos - 10.0),
        noise(ipos * 12.0)
    );

    d = vec3(
        noise(ipos + 7.0),
        noise(ipos - 9.0),
        noise(ipos * 11.0)
    );

    col += palette(
        fpos.x + id*0.05*u_time*sign(id - 0.65),
        a, b, c, d
    );

    col = mix(
        col,
        vec3(1), 
        max(plot(fpos.x, 0.05), plot(fpos.y, 0.05))
    );

    fragColor = vec4(col, 1);

}