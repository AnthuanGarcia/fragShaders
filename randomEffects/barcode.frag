#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define PI 3.14159265

#define DRAW_TWICE 01
#define DRAW_RECT(w, h, p) step(-w, -abs(p.x)) * step(-h, -abs(p.y))
#define DRAW_BARS(p) (DRAW_RECT(width, 0.7, p) * step(0.0, p.y) - DRAW_RECT(width2, 0.7, p) * step(0.0, -p.y)) * sign(p.y)

float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
}

float randomRange (in vec2 seed, in float min, in float max) {
	return min + noise(seed) * (max - min);
}

float smoothNoise(vec2 st) {

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    fpos = fpos*fpos * (3.0 - 2.0 * fpos);

    float bl = noise(ipos);
    float br = noise(ipos + vec2(1, 0));
    float b  = mix(bl, br, fpos.x);
    
    float tl = noise(ipos + vec2(0, 1));
    float tr = noise(ipos + vec2(1));
    float t  = mix(tl, tr, fpos.x);

    return mix(b, t, fpos.y);

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

    move = ceil(uv.x + 0.25*u_time*sign(uv.y));

    float idx2 = floor((uv.x + 191.0 + move) * 55.0);
    float width2 = randomRange(vec2(idx2), -0.7, 0.9*aspect);

    col -= sign(t-0.5)*DRAW_BARS(uv);
        
#else

    col -= DRAW_RECT(width, 0.7, uv);

#endif

    fragColor = vec4(col, 1);

}