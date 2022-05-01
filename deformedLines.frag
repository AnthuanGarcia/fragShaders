#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define TILES 16.0

const float com = 1.0 / TILES;

float line(vec2 st) {
    return smoothstep(0.0025, 0.0, abs(st.y * com));
}

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

vec3 permute(in vec3 x) { 
    return mod( x*x*34.+x, 289.);
}

float snoise(in vec2 v) {

    vec2 i = floor(
            (v.x+v.y)*.36602540378443 + v
        ),
        x0 = (i.x+i.y)*.211324865405187 + v - i;

    float s = step(x0.x,x0.y);

    vec2 j = vec2(1.0-s,s),
        x1 = x0 - j + .211324865405187, 
        x3 = x0 - .577350269189626;

    i = mod(i,289.);

    vec3 p = permute( permute( i.y + vec3(0, j.y, 1 ))+ i.x + vec3(0, j.x, 1 )   ),
        m = max( .5 - vec3(dot(x0,x0), dot(x1,x1), dot(x3,x3)), 0.),
        x = fract(p * .024390243902439) * 2. - 1.,
        h = abs(x) - .5,
        a0 = x - floor(x + .5);

  return .5 + 35. * dot( pow(m,vec3(4.))*(- 0.85373472095314*( a0*a0 + h*h )+1.79284291400159 ), a0 * vec3(x0.x,x1.x,x3.x) + h * vec3(x0.y,x1.y,x3.y));

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    //vec2 mou = u_mouse / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;
    uv *= TILES;
    //mou *= 1.5;

    vec3 col = vec3(0.0, 0.0, .0);

    float t = u_time * 0.5;
    float s = smoothstep(0.0, u_resolution.x * 0.05, uv.x);

    float id = noise(floor(uv));

    uv.y -= (s * snoise(uv) - t*1.25) * step(0.05, id); // Static blocks
    uv.y += sin(4.0*t + uv.x) * sin(t) * step(0.15, id) * 0.95; // Move horizontal Blocks

    vec2 fpos = fract(uv);

    col += line(fpos);
    col += line(fpos - 0.25);
    col += line(fpos - 0.5);
    col += line(fpos - 0.75);
    col += line(fpos - 1.0);

    gl_FragColor = vec4(col, 1.0);

}