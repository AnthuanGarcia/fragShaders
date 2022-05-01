#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ZOOM 4.0

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define FILL(a, b, c) step(-0.17, -abs(tiles.x*0.6666 + a)) * step(-0.332, -abs(tiles.y + b - (tiles.x + c)*0.6666 ))

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (0.5 + ZOOM), t + RX * (0.5 + ZOOM), p);

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= ZOOM;
    vec3 col;

    vec2 r = vec2(cos(1.98), sin(1.98));

    mat2 rot = mat2(
        r[0], r[1],
        -r[1], r[0]
    );

    mat2 rot2 = mat2(
        r[0], -r[1],
        r[1], r[0]
    );

    vec2 iu = uv * rot2;
    vec2 ju = uv * rot;

    //col += plot(
    //    step(0.25, sqrt(dot(iu, iu))),
    //    0.015
    //);

    col += plot( 
        max(0.8*abs(uv.x), 0.8*abs( uv.x + (1.5*uv.y + 1.25) )) - 1.0 * step(0.0, -uv.x),
        0.015
    ) * vec3(1,0,0);

    col += plot( 
        1.2*abs(uv.y - 0.8333) + 0.8*abs(uv.x) - 1.0,
        0.015
    ) * vec3(0, 1, 0);

    col += plot( 
        1.2*abs(iu.y - 0.8333) + 0.8*abs(iu.x) - 1.0,
        0.015
    ) * vec3(0, 0, 1);

    fragColor = vec4(col, 1);

}