#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)

#define ZOOM 10.0
#define ISO_TRI(s, l, p) max( abs(p.y) , abs( s*p.x + p.y*sign(p.x) ) ) - l
#define GLOW(r, d, i) pow(r/(d), i)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (0.5 + ZOOM), t + RX * (0.5 + ZOOM), p);

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= ZOOM;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(1);

    uv.y += 0.75*cos(1.50*uv.x + u_time) * 0.5*cos(u_time);

    vec2 fpos = fract(uv) - 0.5;
    fpos.y += 0.1;
    //uv.y -= u_time;

    //float t = 2.0*sin(u_time);
    col -= plot( abs( ISO_TRI(1.0, 0.5, fpos ) )   , 0.015 );
    //col += GLOW(0.015, abs(ISO_TRI(1.0, 0.5, fpos )), 0.95);
    //col += plot( abs( ISO_TRI(0.1 * t, 1.5, uv ) )   , 0.015 );
    //col += plot( abs( ISO_TRI(0.05 * t, 1.0, uv ) )   , 0.015 );
    //col += plot( abs( ISO_TRI(0.025 * t, 0.5, uv ) )   , 0.015 );
    //col += plot( abs( ISO_TRI(0.0125 * t, 0.15, uv ) )  , 0.015 );

    //col = 1.0 - exp( -col );

    fragColor = vec4(col, 1);
}