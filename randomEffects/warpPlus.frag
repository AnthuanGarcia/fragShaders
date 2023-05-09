#version 300 es

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

out vec4 fragColor;

float noise1(vec2 st) {
    return fract(sin(dot(st, vec2(15.3178, 98.091))) * 6754.456);
}

float randomRange(in vec2 seed, in float min, in float max){
    return min + noise1(seed) * (max - min);
}

mat2 rot2D(float angle){

    float c = cos(angle);
    float s = sin(angle);

    return mat2(c, -s, s, c);

}

void main(void) {

    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	vec2 mouse = u_mouse / u_resolution;
    vec2 uv2 = uv * (1.0 - uv.yx);

    uv.y *= u_resolution.y / u_resolution.x;
	mouse.y *= u_resolution.y / u_resolution.x;

	vec2 uv3 = uv * 0.5;
	mouse *= 0.5;

    float vig = uv2.x*uv2.y * 20.0;

    uv *= rot2D(u_time * 0.025);

    uv *= 0.5;
    uv -= 1.5;

    // 0.1 0.4

	uv += mouse * 0.25;

    for(float i = 1.0; i < 4.0; i += 0.5){

        uv.x += 0.1/i * cos( uv.y * i * 10.0 + u_time * 0.5);
        uv.y += 0.4/i * sin( uv.x * i *  7.0 + u_time * 0.5);

        uv *= rot2D(u_time * 0.005);

    }

    float a = cos(uv.x + sin(uv.y) + 0.5*u_time) *0.5 + 0.5;

    vec3 col = mix(
        vec3(0.5, 0.5, 1),
        vec3(1, 0.85, 1),
        a
    );

    vec3 col2 = mix(
        vec3(0.85, 1, 0),
        vec3(1, 0.5, 0),
        a
    );

    col = mix(
        col,
        vec3(1, 0, 0.4),
        sin(uv.y + cos(uv.x) ) *0.5 + 0.5
    );

    col = mix( col, col2, uv.x);
    col = sqrt(col);
    vig = pow(vig, 0.2);
    col = mix(
        col, vec3(0), 1.0 - vig
    );

    fragColor = vec4(col, 1.0);

}