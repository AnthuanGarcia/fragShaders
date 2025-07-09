#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ZOOM 10.0

#define RX 1.0 / min(u_resolution.x, u_resolution.y)

#define PAL20 vec3(0.275, 0.584, 0.823), vec3(0.869, 0.354, 0.288), vec3(0.479, 0.461, 0.015), vec3(4.714, 3.884, 5.150)
#define PAL25 vec3(1.158, 0.200, 0.758), vec3(0.138, 0.538, 0.233), vec3(1.135, -0.392, 0.898), vec3(2.188, 2.333, 3.195)

float aastep(float threshold, float value) {


    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;

    return smoothstep(threshold-afwidth, threshold+afwidth, value);


}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( 6.283185*(c*t + d) );

}

mat2 rot2D(float angle, float clock) {


    float c = cos(angle);

    float s = sin(angle);


    return mat2(

        c, clock*s,

        -clock*s, c

    );


}


void main() {


    vec2 uv = gl_FragCoord.xy / u_resolution.y - 0.5;

    vec2 xuv = uv*10.;

    uv *= ZOOM;


    for(float i = 0.; i < 0.8; i += 0.2) {

        uv.x += 0.5*sin(uv.y*i*3.0 + u_time);

        uv.y -= 0.5*cos(uv.x*i*3.0 + u_time) + 0.5*sin(0.1*u_time);

        uv *= rot2D( length(uv) * 0.25 * i, sin(0.1*u_time));

    }


    //uv *= rot2D(0.15*u_u_time, 0.0);


    vec2 fpos = fract(uv);
    vec2 ipos = floor(uv * 5.0);

	float s = mod(abs(ipos.x), 3.0);

    mat3 palettes = mat3(
        palette(uv.y*0.25 + u_time, PAL20),
        vec3(0),
        palette(uv.y*0.5 - u_time, PAL25)
    );

    int idx = 3;
    vec3 col = palettes[0];


    col = mix(

        /*mix(

            vec3(0),

            vec3(.0, .0, 1.0),

            -xuv.y +5.0

        ),*/
		col,
        palettes[1],
        aastep( 0.5, step(1.0, s))

    );

    col = mix(col, palettes[2], aastep(0.5, step(2.0, s)));


    fragColor = vec4(col, 1);


}

