#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;

    vec3 col;

    fragColor = vec4(col, 1);

}

/*
    v.rgba colores
    v.xyzw Posiciones
    v.stpq Texturas
    v[0], v[1], v[2], v[3] Lo que sea
*/

#define MOCO         vec3(0.87, 1, 0)
#define PINK_NOT_GAY vec3(1, 0, 0.5)
#define PINK_GAY     vec3(1, 0.75, 1)
#define ORANGE       vec3(0.9, 0.65, 0)

/* ---- Constants ------ */

#define TWO_PI 6.283185

/* ---------------------- */

/* ----- Utilities ----- */

// Gamma correction
// col = 1.0 - exp( -col );
#define GLOW(r, d, i) pow(r/(d), i)
#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define CIRCLE(r, p) length(p) - abs(r) // Este va con plotting
#define CIRCLE2(r, p) step(-r*r, -dot(p, p))
#define SQUARE(l, p) max(p.x, p.y) - l
#define SDF_SQR(l, p) length( max(abs(p) - l, 0.0) )
#define ISO_TRI(s, l, p) max( abs(p.y) , abs( s*p.x + p.y*sign(p.x) ) ) - l // chafa
#define ROMBO(fx, fy, l, p) fx*p.x + fy*p.y - l
#define ELIPSE(sxy, p, l) dot(p * sxy, p) - l

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

float gridp(float x, float t) {

    float k = 0.5;
    float f = fract(x);
    
    return smoothstep(k - t, k, f) * (1.0 - smoothstep(k, k + t, f));
}

mat2 rot2D(float angle, float clock) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, clock*s,
        -clock*s, c
    );

}

float noise(vec2 st) {

    return fract(
        sin(
            dot(
                st.xy,
                vec2(12.9898,78.233)
            )
        ) * 43758.5453123
    );

}

float randomRange (in vec2 seed, in float min, in float max) {
	return min + noise(seed) * (max - min);
}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( TWO_PI*(c*t + d) );

}

/* -------------------- */
