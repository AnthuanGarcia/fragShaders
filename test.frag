#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 colorA = vec3(0.9647, 0.4706, 0.1412);
vec3 colorB = vec3(1.0, 0.7686, 0.0);

vec3 colorC = vec3(0.1412, 0.8431, 0.9647);
vec3 colorD = vec3(0.5098, 0.0275, 0.9608);

float plot(vec2 st, float pct) {
    return smoothstep(pct - 0.01, pct, st.y) - smoothstep(pct, pct + 0.01, st.y);
}

void main() {

    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 col = vec3(0);

    //pct.r = smoothstep(0.0, 1.0, st.y);
    //pct.g = sin(st.x * PI);
    //pct.b = pow(st.y, 0.5);

    col = mix(mix(colorA, colorC, sin(u_time)),  mix(colorB, colorD, sin(u_time)), st.y);
    //col = mix(colorC, colorD, pct * sin(u_time * 0.5));
    //col = mix(colorC, colorD, pct + sin(u_time * 0.5));

    //col = mix(col, mix(colorC, colorD, pct), pct);

    //col = mix(col, vec3(1, 0, 0), plot(st, pct.r));
    //col = mix(col, vec3(0, 1, 0), plot(st, pct.g));
    //col = mix(col, vec3(0, 0, 1), plot(st, pct.b));

    gl_FragColor = vec4(col, 1.0);

}