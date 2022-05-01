#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define TWO_PI 6.283185

#define PAL1 vec3(0.546,0.542,0.285),\
             vec3(0.764,0.114,0.041),\
               vec3(0.714,0.819,1.286),\
               vec3(1.959,2.658,2.063)

#define PAL2 vec3(0.888,0.218,1.108),\
        vec3(0.968,-0.472,0.63),\
        vec3(1.218,0.888,0.00),\
        vec3(-1.582,1.808,1.478)

#define PAL3 vec3(0.845, 0.329, 0.406), vec3(0.485, 0.034, 0.578), vec3(1.055, 0.714, 1.339), vec3(1.663, 1.929, 6.007)
#define PAL4 vec3(0.623, 0.354, 1.061), vec3(0.850, 0.523, 0.773), vec3(0.688, 0.846, 0.055), vec3(6.736, 2.330, 5.302)
#define PAL5 vec3(0.519, 0.756, 0.712), vec3(0.840, 0.834, 0.469), vec3(0.302, 1.019, 0.804), vec3(3.159, 4.132, 5.220)

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( TWO_PI*(c*t + d) );

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

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
    //uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = palette(uv.x + 0.5, PAL5);

    fragColor = vec4(col, 1);

}