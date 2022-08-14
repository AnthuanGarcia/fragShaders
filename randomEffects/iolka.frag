#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define R 1.75
#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define CIRCLE(r, p) length(p) - abs(r)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

float gridp(float x, float t) {

    float k = 0.5;
    float f = fract(x);
    
    return smoothstep(k - t, k, f) * (1.0 - smoothstep(k, k + t, f));
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

    vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
    uv.x *= u_resolution.x / u_resolution.y;
    uv *= 6.0;

    vec2 warp = uv*0.5;

    for(float i = 1.0; i < 16.0; i++) {

        warp.x += 0.4/i * sin(2.0*i*warp.y + u_time) + cos(u_time*0.05);
        warp.y += 0.5/i * cos(2.0*i*warp.x + u_time) + sin(u_time*0.05);

    }

    vec3 col = vec3(1);

    vec2 circle = uv + vec2(0, 0.9);
    vec2 otherCircle = uv - vec2(0, 0.7);

    uv += 0.25*u_time;

    vec2 rotuv = uv * rot2D(radians(15.0), 1.0);    
    vec2 fpos = fract(uv * 3.0);
    vec2 rpos = fract(rotuv * 3.0);

    float c = step(-R*R, -dot(circle, circle));

    col = mix(
        col,
        vec3(0),
        (gridp(abs(fpos.x - 0.1), 0.05) +
        gridp(abs(fpos.x - 0.6), 0.05))
    );

    vec3 col2 = vec3(
        sin(warp.x + warp.y) * 0.5 + 1.2,
        cos(warp.y - warp.x) * 0.5 + 0.2,
        sin(warp.x) * cos(warp.y) + 0.6
    );

    col = mix(col, col2, plot(CIRCLE(R, otherCircle), 0.0));

    col = mix(
        col,
        vec3(1),
        plot(CIRCLE(R, circle), 0.0)
    );

    col = mix(
        col,
        vec3(0),
        (gridp(abs(rpos.x - 0.1), 0.05) +
        gridp(abs(rpos.x - 0.6), 0.05)) * c
    );

    fragColor = vec4(col, 1);

}