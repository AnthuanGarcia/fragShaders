#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

mat2 rot2D(float angle) {
    float s = sin(angle), c = cos(angle);
    return mat2(c, -s, s, c);
}

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

float smoothNoise(vec2 n) {

    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(noise(b), noise(b + d.yx), f.x), mix(noise(b + d.xy), noise(b + d.yy), f.x), f.y);

}

void main() {

    vec2 uv = (2.0*gl_FragCoord.xy - u_resolution.xy)/u_resolution.y;
    uv *= 0.75;
    vec2 pq = uv;

    vec3 col;

    float t = u_time * 0.5;

    float noi = smoothNoise(uv + u_time) * 0.15 - 0.15;

    for (float i = 1.0; i <= 3.0; i += 0.75) {

        pq.x+=length(pq.y*0.25)/i*cos(i*pq.y*5.+t);
		pq.y+=length(pq.x*0.25)/i*sin(i*pq.x*3.+t);
        pq *= rot2D(length(pq) * sin(t)*0.5);
        noi += smoothNoise(uv)*0.2;

    }

    vec3 a = vec3(
        sin(pq.x + pq.y),
        cos(pq.x + uv.y),
        sin(pq.y + uv.x)
    ) * 0.5 + 0.5;

    col = mix(
        vec3(0.0, 0.949, 1.0),
        mix(
            vec3(0.949, 0.3686, 0.7255),
            vec3(0.9569, 0.8078, 0.0745),
            noi
        ),
        a
    );

	fragColor = vec4(col, 1);
}
