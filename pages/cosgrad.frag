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
#define PAL6 vec3(0.530, 0.787, 0.485), vec3(0.420, 0.089, 0.758), vec3(0.133, 0.924, 0.008), vec3(4.820, 4.553, 2.869)
#define PAL7 vec3(0.836, 0.796, 0.761), vec3(0.637, 0.568, 0.489), vec3(0.719, 0.209, 0.295), vec3(4.059, 3.528, 3.373)
#define PAL8 vec3(0.842, 0.420, 0.185), vec3(0.719, 0.625, 0.445), vec3(0.468, 0.132, 1.118), vec3(7.029, 2.147, 5.438)
#define PAL9 vec3(0.376, 0.777, 0.959), vec3(0.501, 0.477, 0.745), vec3(0.228, 0.161, 0.014), vec3(3.083, 1.247, 0.834)
#define PAL10 vec3(0.500, 0.830, 0.168), vec3(-0.500, 0.400, 0.968), vec3(-0.500, 0.150, 0.000), vec3(2.000, -1.767, 0.177)
#define PAL11 vec3(0.910, 0.960, 0.897), vec3(0.814, 0.588, 0.735), vec3(0.888, -0.552, 1.110), vec3(4.227, 3.567, 5.852)
#define PAL12 vec3(0.300, 0.500, 0.357), vec3(0.698, 0.468, 0.299), vec3(0.768, 1.257, 1.503), vec3(2.824, 3.537, 3.216)
#define PAL13 vec3(0.998, 0.608, 0.998), vec3(0.418, 0.500, 0.500), vec3(1.000, 1.000, 1.000), vec3(1.000, 1.333, 1.667)
#define PAL14 vec3(0.611, 0.838, 0.364), vec3(0.740, 0.426, 0.795), vec3(0.979, 0.959, 1.211), vec3(2.695, 0.179, 2.044)
#define PAL15 vec3(0.690, 0.838, 0.364), vec3(0.740, 0.426, 0.795), vec3(0.979, 0.959, 0.558), vec3(2.695, 0.173, 1.028)
#define PAL16 vec3(0.650, 0.500, 0.310), vec3(-0.650, 0.500, 0.600), vec3(0.333, 0.278, 0.278), vec3(0.660, 0.000, 0.667)

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( 6.283185*(c*t + d) );

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

    vec2 uv = gl_FragCoord.xy / u_resolution;
    //uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(1);

    col = mix(
        palette(uv.x, PAL9),
        col,
        step(0.075, abs(uv.y - 0.5))
    );


    fragColor = vec4(col, 1);

}
