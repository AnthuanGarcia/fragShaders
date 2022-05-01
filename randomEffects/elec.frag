#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

#define CIRCLES 0
#define ZOOM    4.0

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define CIRCLE(r, c) length(c) - abs(r)

// p - point (punto que se va a graficar)
// t - thickness (Grosor del punto que se va a graficar)
float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (0.5 + ZOOM), t + RX * (0.5 + ZOOM), p);

}

float noise_1(vec2 st) {

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
	return min + noise_1(seed) * (max - min);
}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;
    //uv -= 0.5;
    uv *= ZOOM;

    uv.x += 0.25*u_time;

    vec3 col = vec3(0.7216, 0.7529, 0.8431);
    vec3 colRings = vec3(1);
    //vec3 col = vec3(1);

    vec2 fpos = fract(uv) - 0.5;

    float midCircles =
    plot(abs( CIRCLE(0.05, fpos + vec2(0.5) )), 0.01) + 
    plot(abs( CIRCLE(0.05, fpos + vec2(-0.5)) ), 0.01) + 
    plot(abs( CIRCLE(0.05, fpos + vec2(-0.5, 0.5)) ), 0.01) +
    plot(abs( CIRCLE(0.05, fpos + vec2(0.5, -0.5)) ), 0.01);

    float movx = noise_1(floor(uv));
    float movy = noise_1(floor(uv + 5.0));

    float n1 = randomRange(floor(uv + 10.0), 0.1, 0.5);
    float n2 = randomRange(floor(uv + 15.0), 0.1, 0.5);
    float n3 = randomRange(floor(uv + 20.0), 0.1, 0.5);
    float n4 = randomRange(floor(uv + 25.0), 0.1, 0.5);
    float n5 = randomRange(floor(uv + 30.0), 0.1, 0.5);
    float n6 = randomRange(floor(uv + 35.0), 0.1, 0.5);
    float n7 = randomRange(floor(uv + 45.0), 0.1, 0.5);
    float n8 = randomRange(floor(uv + 50.0), 0.1, 0.5);

    float x = 0.1*step(0.5, movx) + 0.2*step(-0.5, -movx);
    float y = 0.1*step(0.5, movy) + 0.2*step(-0.5, -movy);

    vec2 circ = 0.2 *vec2(cos(0.5*u_time), sin(0.5*u_time)) * step(0.85, movx);

    float intCircles = 
    plot(abs( CIRCLE(0.2, fpos + vec2(-x, 0) + circ * vec2(n1, n8)  ) ), 0.01) + 
    plot(abs( CIRCLE(0.2, fpos + vec2(x, 0)  + circ * vec2(n2, n7)  ) ), 0.01) + 
    plot(abs( CIRCLE(0.2, fpos + vec2(0, y)  + circ * vec2(n3, -n6) ) ), 0.01) +
    plot(abs( CIRCLE(0.2, fpos + vec2(0, -y) + circ * vec2(-n4, n5) ) ), 0.01);

#if CIRCLES

    colRings -= 1.0;

    col = mix(
        col,
        vec3(0),
        smoothstep(0.2, -0.15, CIRCLE(0.3, fpos + vec2(-0.05, 0)))
    ) + plot((CIRCLE(0.4, fpos)), 0.0);

#endif

    col = mix(col, vec3(0.8863, 0.9059, 0.9647), midCircles);
    col = mix(col, colRings, intCircles);

    fragColor = vec4(col, 1);

}