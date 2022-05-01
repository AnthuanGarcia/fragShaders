#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

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
    st.x *= u_resolution.x/u_resolution.y;

    /*
    vec3 rnd = random(st * sin(u_time)) * vec3(1);
    gl_FragColor = vec4(rnd, 1.0);
    */

    st *= 75.0;
    vec2 ipos = floor(st);

    vec3 col = vec3(random(ipos), 0, 1);

    gl_FragColor = vec4(col, 1.0);

}