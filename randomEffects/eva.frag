#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture_0;
uniform sampler2D u_texture_1;

out vec4 fragColor;

const vec2 resTex = vec2(1725, 2588);

#define SIN_01 (sin(u_time) * 0.5 + 0.5)

mat2 rot2D(float angle) {

	float c = cos(angle), s = sin(angle);
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

    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 st = gl_FragCoord.xy / resTex;

	//vec2 uv = (2.0*gl_FragCoord.xy - u_resolution.xy)/u_resolution.x;

    float m = smoothNoise(ceil(st) + u_time*10.0) * 0.005;

    vec3 col = texture(u_texture_1, uv).rgb;

    //col = pow(col, vec3(1.4, 1, 1.6));

    fragColor = vec4(col, 1);

}