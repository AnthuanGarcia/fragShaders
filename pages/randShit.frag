#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define OCTAVES 3

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

float smoothNoise(vec2 n) {

    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(noise(b), noise(b + d.yx), f.x), mix(noise(b + d.xy), noise(b + d.yy), f.x), f.y);

}

float fbm(vec2 st) {

    float val = 0.0;
    float am = 0.5;
    float fm = 1.0;

    for (int i = 0; i < OCTAVES; i++) {

        val += am * smoothNoise(st);
        st *= 1.5;
        am *= 0.5;

    }

    return val;

}

void main() {

    vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution)-1.0;
    uv *= 10.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 a = vec2(
        fbm(uv - u_time),
        fbm(uv + u_time)
    );

    a = vec2(
        fbm(a * 2.5),
        fbm(a * 5.0)
    );

    vec3 col = vec3(
        cos(10.0*sin(a.x / a.y)),
        sin(3.5*cos(a.x / a.y)),
        cos((10.0 * (sin(0.5*u_time) + 1.0)) *tan(a.x / a.y))
    );

    fragColor = vec4(col, 1);

}