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

float noise(vec2 st) {

    vec2 ist = vec2(floor(st));
    float fst = random(vec2(fract(st)));

    return mix(
        random(ist),
        random(ist + 1.0),
        smoothstep(0.0, 1.0, fst)
    );

}

void main() {

    vec2 st = gl_FragCoord.xy / u_resolution;

    /*
    vec3 rnd = random(st * sin(u_time)) * vec3(1);
    gl_FragColor = vec4(rnd, 1.0);
    */

    st *= 30.0;

    vec3 col = vec3(0.8392, 0.9098, 0.9529) * noise(st + u_time);

    gl_FragColor = vec4(col, 1.0);


}