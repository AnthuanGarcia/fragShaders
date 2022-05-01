#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

float noise_1(vec2 st) {

    return fract(
        sin(
            dot(
                st.xy,
                vec2(12.9898,78.233)
            )
        ) * 43758.5453123
    );

}

vec2 noise_2(vec2 p) {

    return fract(
        sin(
            vec2(
                dot(p, vec2(130.7, 541.2) ),
                dot(p, vec2(696.69, 101.4))
            )
        ) * 679812.7684
    );

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= 10.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col;

    uv.y -= uv.x;

    vec2 ipos = floor(uv);

    vec2 uv2 = noise_2(ipos);
    vec2 uv3 = noise_2(floor(uv + u_time));
    vec2 uv4 = noise_2(floor(uv - u_time));

    vec2 a = mix(ipos, uv2, ipos.x);
    a = mix(a, uv3, uv2.y);
    a = mix(a, uv4, uv3.x);
    a = mix(a, ipos, uv4.y);

    col = mix( vec3(0.9333, 0.5961, 0.149), vec3(1.0, 0.7686, 0.0), a.x - a.y );
    //col = mix( col, vec3(1.0, 0.0, 0.8), a.y );

    fragColor = vec4(col, 1);

}