#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define GLOW(r, d, i) pow(r/(d), i)

#define COL1 vec3(1.0, 0.4824, 0.0)
#define COL2 vec3(0.9216, 0.549, 0.3176)
#define COL3 vec3(1.0, 0.2353, 0.0)

void main() {

    vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    //uv *= 1.0;

    vec3 col;

    for (float i = 1.0; i < 7.0; i++) {

        uv.x += 0.5/i * sin(3.0*i*uv.y + u_time*0.5) + u_time*0.01;
        uv.y -= 0.5/i * cos(3.0*i*uv.x + u_time*0.5);

    }

    //vec2 uv2, uv3;
    vec2 uv2 = uv;
    vec2 uv3 = uv;

    float sint = sin(u_time);

    uv.y  -= sint * cos(uv.x + u_time);
    uv2.x -= sint * cos(uv2.y + u_time);
    uv3.y -= 0.9*cos(2.0*u_time) * uv3.y;

    float disth = abs(uv.y) * 20.0;
    float distv = abs(uv2.x) * 20.0;
    float distd = abs(uv3.y) * 20.0;

    col += GLOW(0.5, disth,  1.350) * COL1 +
           GLOW(0.5, distv,  1.350) * COL2 + 
           GLOW(0.5, distd,  1.350) * COL3;
    
    col = 1.0 - exp( -col );

    gl_FragColor = vec4(col, 1.0);

}