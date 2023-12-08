#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define PI 3.14159265

#define DRAW_TWICE 01
#define DRAW_RECT(w, h, p) step(-w, -abs(p.x)) * step(-h, -abs(p.y))

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

float smoothNoise(vec2 n) {

    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(noise(b), noise(b + d.yx), f.x), mix(noise(b + d.xy), noise(b + d.yy), f.x), f.y);

}

float randomRange (in vec2 seed, in float min, in float max) {
	return min + noise(seed) * (max - min);
}


void main() {

    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;

    float move = ceil(uv.x + 0.25*u_time);

    float idx  = floor((uv.x + move) * 60.0);
    float width  = randomRange(vec2(idx), 0.0, 0.9*aspect);

    float t = step(0.5, smoothNoise(vec2(u_time)));
    vec3 col = vec3(t);

#if DRAW_TWICE

#define DRAW_BARS(p) (DRAW_RECT(width, 0.7, p) * step(0.0, p.y) - DRAW_RECT(width2, 0.7, p) * step(0.0, -p.y)) * sign(p.y)

    move = ceil(uv.x + 0.25*u_time*sign(uv.y));

    float idx2 = floor((uv.x + 191.0 + move) * 55.0);
    float width2 = randomRange(vec2(idx2), -0.7, 0.9*aspect);

    col -= sign(t-0.5)*DRAW_BARS(uv);
        
#else

    col -= sign(t-0.5)*DRAW_RECT(width, 0.7, uv);

#endif

    fragColor = vec4(col, 1);

}