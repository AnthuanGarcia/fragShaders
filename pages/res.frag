#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ZOOM 10.0
#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define ISO_TRI(s, l, p) max( abs(p.y) , abs( s*p.x + p.y*sign(p.x) ) ) - l

const float inx = 1.0 / ZOOM;

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX*(0.5 + ZOOM), t + RX*(0.5 + ZOOM), p);
    //return smoothstep(0.09, 0.0, p);
}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= ZOOM;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col;

    //uv.y -= u_time;
    //uv.y += sin(uv.x);

    col += plot( abs( ISO_TRI(2.0, 2.0, uv ) )   , 0.015 );
    col += plot( abs( ISO_TRI(2.0, 1.5, uv ) )   , 0.015 );
    col += plot( abs( ISO_TRI(2.0, 1.0, uv ) )   , 0.015 );
    col += plot( abs( ISO_TRI(2.0, 0.5, uv ) )  , 0.015 );
    col += plot( abs( ISO_TRI(2.0, 0.15, uv ) ) , 0.015 );

    fragColor = vec4(col, 1);

}
