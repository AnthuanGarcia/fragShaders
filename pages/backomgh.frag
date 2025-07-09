#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y
#define PI 3.14159265
#define D2R 0.0174532925

mat2 rot2D(float angle) {
	float c = cos(angle), s = sin(angle);
	return mat2(c, s, -s, c);
}

void main() {

    float mr = min(u_resolution.x, u_resolution.y);
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / mr;

    uv *= mat2(1,tan(-0.5),0,1);

    uv.x += sin(uv.y + u_time * 0.05)*0.75;

    vec2 ipos = floor(uv * 8.0);
    float d = -u_time * 0.1;
    float a = 0.0;

    for (float i = 0.0; i < 10.0; ++i) {
        a += cos(i - d - a * uv.x);
        d += sin(uv.y * i + a + d);
        uv *= rot2D(ipos.x);
    }

    d += u_time * 0.1;
    vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
    col = cos(col * cos(vec3(d, a, ipos.x)) * 0.5 + 0.5);
    fragColor = vec4(col, 1);
}
