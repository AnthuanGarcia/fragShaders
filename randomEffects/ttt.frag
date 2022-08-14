#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

float gridp(float x, float t) {

    float k = 0.5;
    float f = fract(x);
    
    return smoothstep(k - t, k, f) * (1.0 - smoothstep(k, k + t, f));
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

    vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
    uv *= 15.0;
    uv.x *= u_resolution.x / u_resolution.y;

    float t = u_time;

    float id = smoothNoise((uv + t) * 0.4);
    vec3 col = vec3(1);

    uv += id;
    id = smoothNoise((uv + t) * 0.25);
    uv -= id;

    col -= gridp(abs(uv.y), 0.05) + gridp(abs(uv.x), 0.05);

    fragColor = vec4(col, 1);

}
