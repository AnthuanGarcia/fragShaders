#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture_0;
uniform sampler2D u_texture_1;

out vec4 fragColor;

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

vec3 Cartesian2DToBarycentric(vec2 p)
{    
    return vec3(p, 0.0) * mat3(vec3(0.0, 1.0 / 0.8660254037844387, 0.0),
                          vec3(1.0, 0.5773502691896257, 0.0),
                          vec3(-1.0, 0.5773502691896257, 0.0));    
}

float gridp(float x, float t) {

    float k = 0.5;
    float f = fract(x);
    
    return smoothstep(k - t, k, f) * (1.0 - smoothstep(k, k + t, f));

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;
    uv *= 8.0;

	//vec2 uv = (2.0*gl_FragCoord.xy - u_resolution.xy)/u_resolution.x;
    vec3 bar = Cartesian2DToBarycentric(uv);

    vec3 col;
    col += max(max(gridp(bar.x, 0.05), gridp(bar.y, 0.05)), gridp(bar.z, 0.05));

    fragColor = vec4(col, 1);

}