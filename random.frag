#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float random(vec2 st) {
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

    vec2 st = gl_FragCoord.xy / u_resolution;

    /*
    vec3 rnd = random(st * sin(u_time)) * vec3(1);
    gl_FragColor = vec4(rnd, 1.0);
    */

    st *= 25.0;
    vec2 ipos = floor(st);

    vec3 col = random(ipos + sin(u_time)) * vec3(1, 1, 10);

    gl_FragColor = vec4(col, 1.0);

}