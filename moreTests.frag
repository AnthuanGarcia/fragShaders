#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define POINT_1 vec3(0.2, 0.1, 1.0)
#define POINT_2 vec3(0.9, 0.8, 1.0)
#define CONTROL_POINT vec3(0.3, 0.75, 1.0)

vec3 point_1 = POINT_1;
vec3 point_2 = POINT_2;
vec3 control_point = CONTROL_POINT;

void main() {

    vec2 uv  = gl_FragCoord.xy / u_resolution;
    //uv -= 0.5;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0);

    uv *= 100.0;

    float v = dot(uv, uv) - 0.025;
    vec2 g = 2.0*uv;

    float circle = v / length(g);

    //p -= vec3(0.3, 0.75, 1.0);

    //col += smoothstep(0.0, 0.05, abs(p.x));
    //col += smoothstep(0.0, 0.05, abs(p.y));
    col += circle;

    gl_FragColor = vec4(col, 1.0);

}