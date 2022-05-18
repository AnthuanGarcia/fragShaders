#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ZOOM 5.0
#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define TWO_PI 6.283185

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( TWO_PI*(c*t + d) );

}

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (0.5 + ZOOM), t + RX * (0.5 + ZOOM), p);

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

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.y - 0.5;
    uv *= ZOOM;

    uv *= mat2(
        1, tan(0.5),
        0, 1
    );

    uv.x += 0.1*u_time;
    uv.y += 0.1*u_time * sign( mod(floor(uv.x), 2.0) - 0.5 );

    vec2 fpos = fract(uv);
    vec2 ipos = floor(uv);
    vec2 aux = uv;

    float rnd = randomRange(ipos, 0.3, 0.4);
    float rndI = randomRange(ipos, 2.0, 6.0);

    for (float i = 1.0; i < 7.0; i++) {

        aux.x += rnd/i * sin(rndI*i*aux.y + u_time) + u_time*0.01;
        aux.y -= rnd/i * cos(rndI*i*aux.x + u_time);

    }

    vec3 col;

    aux = fract(aux);

    //col = mix(
    //    col, 
    //    vec3(0.45),
    //    max(plot(aux.y, 0.1), plot(aux.x, 0.1))
    //);

    float id = noise(ipos);
    float ton = sin(u_time) * step(0.1, id) + step(-0.1, -id);

    vec3 a, b, c, d;
    
    a = vec3(
        noise(ipos + 2.0),
        noise(ipos - 4.0),
        noise(ipos * 6.0)
    );

    b = vec3(
        noise(ipos + 1.0),
        noise(ipos - 3.0),
        noise(ipos * 5.0)
    ) * ton;

    c = vec3(
        noise(ipos + 8.0),
        noise(ipos - 10.0),
        noise(ipos * 12.0)
    );

    d = vec3(
        noise(ipos + 7.0),
        noise(ipos - 9.0),
        noise(ipos * 11.0)
    );

    vec3 col1 = palette(
        aux.x + id*0.05*u_time*sign(id - 0.65),
        a, b, c, d
    );

    vec3 col2 = palette(
        aux.y + id*0.05*u_time*sign(id - 0.65),
        d, c, a, b
    );

    col = mix(
        col1,
        col2,
        max(aux.x, aux.y)
    );

    col = mix(
        col, 
        vec3(1),
        max(plot(fpos.y, 0.025), plot(fpos.x, 0.025))
    );

    fragColor = vec4(col, 1);

}
