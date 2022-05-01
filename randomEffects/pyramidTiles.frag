#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define ZOOM 4.0
#define ROMBO(fx, fy, l, p) fx*p.x + fy*p.y - l

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (0.5 + ZOOM), t + RX * (0.5 + ZOOM), p);

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= ZOOM;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(1);

    //vec2 fpos = fract(uv) - 0.5;

    vec2 shift = vec2(0, 0.25);
    vec4 s = vec4(1.0, -1.0, 0.5, -0.5);

    for (int i = 0; i < 6; i++) {

        float fill = 
        plot( ( ROMBO(0.5, 1.0, .250, abs(uv + shift       )) ), 0.0085) +
        plot( ( ROMBO(0.5, 1.0, .250, abs(uv + shift + s.xz)) ), 0.0085) +
        plot( ( ROMBO(0.5, 1.0, .250, abs(uv + shift + s.xw)) ), 0.0085) +
        plot( ( ROMBO(0.5, 1.0, .250, abs(uv + shift + s.yz)) ), 0.0085) +
        plot( ( ROMBO(0.5, 1.0, .250, abs(uv + shift + s.yw)) ), 0.0085) + 
        plot( ( ROMBO(0.5, 1.0, .250, abs(uv + shift + vec2(0, 1.0)  )) ), 0.0085) + 
        plot( ( ROMBO(0.5, 1.0, .250, abs(uv + shift + vec2(0, -1.0) )) ), 0.0085);

        float stroke = 
        plot( abs( ROMBO(0.5, 1.0, .250, abs(uv + shift)) ), 0.0085) +
        plot( abs( ROMBO(0.5, 1.0, .250, abs(uv + shift + s.xz)) ), 0.0085) +
        plot( abs( ROMBO(0.5, 1.0, .250, abs(uv + shift + s.xw)) ), 0.0085) +
        plot( abs( ROMBO(0.5, 1.0, .250, abs(uv + shift + s.yz)) ), 0.0085) +
        plot( abs( ROMBO(0.5, 1.0, .250, abs(uv + shift + s.yw)) ), 0.0085) +
        plot( abs( ROMBO(0.5, 1.0, .250, abs(uv + shift + vec2(0, 1.0) )) ), 0.0085) + 
        plot( abs( ROMBO(0.5, 1.0, .250, abs(uv + shift + vec2(0, -1.0))) ), 0.0085);

        col = mix(col, vec3(1), fill);
        col = mix(col, vec3(0), stroke);

        shift.y -= 0.1*abs(sin(3.0*u_time));
    
    }

    //col = mix(col, vec3(0), plot(abs(fpos.y), 0.015) + plot(abs(fpos.x), 0.015));

    fragColor = vec4(col, 1);

}