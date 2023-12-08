#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define MAX_DIST 50.0
#define MIN_DIST 0.0
#define STEPS    32
#define LIM_VAL  1E-4

#define D2R 0.01745

mat2 rot2D(float theta) {

    float c = cos(theta), s = sin(theta);
    return mat2(c, s, -s, c);

}

float sphere(vec3 p, float r) {

    return length(p) - r;

}

float cube(vec3 p, float l) {
    vec3 c = abs(p);
    return max(max(c.x, c.y), c.z) - l;
}

float torus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz)-t.x,p.y);
    return length(q)-t.y;
}

float opSmoothIntersection( float d1, float d2, float k ) {
    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) + k*h*(1.0-h);
}

float map(vec3 p) {

    p.xy *= rot2D(90.0 * D2R);
    p.yz *= rot2D(90.0 * D2R);

    p.yz *= rot2D(u_time * 0.25);
    p.xz *= rot2D(u_time * 0.25);
    p.xy *= rot2D(u_time * 0.25);

    vec3 q = p + u_time;

    float t = torus(p, vec2(20.0, 10.));
    float d = (sin(q.x)*sin(q.y)*cos(q.z));

    float c = cube(p, 15.0);
    float s = sphere(p, 20.0);

    return opSmoothIntersection(s, t, 0.75) + d;
}

float march(vec3 ro, vec3 rd) {

    float p = 0.001;
    float s = 2.0*p;
    float d = MIN_DIST;

    for (int i = 0; i < STEPS; i++) {

        if (abs(s) < p || d >= MAX_DIST) break;

        d += s;
        s = map(ro + rd*d);

    }

    return d;

}

vec3 getNormal(vec3 p) {

    const vec2 h = vec2(LIM_VAL, 0.0);

    return normalize(
        vec3(
            map(p + h.xyy) - map(p - h.xyy),
            map(p + h.yxy) - map(p - h.yxy),
            map(p + h.yyx) - map(p - h.yyx)
        )
    );

}

vec3 sun = vec3(50, 100, -50);

vec3 shade(vec3 ro, vec3 rd, vec3 p, vec2 uvp) {

    vec3 n = getNormal(p);
    vec3 lightDir = normalize(sun - p);
    vec3 viewDir = normalize(ro - p);

    vec3 ref = normalize(reflect(-lightDir, n));
    float front = max(dot(viewDir, n), 0.0);
    float kw = (1.0 + dot(n, lightDir)) * 0.5;

    vec3 ambient = mix(
        //mix(
            vec3(0.651, 0.0, 1.0),
          //  vec3(1.0, 0.5, 0),
            //uvp.x + 0.5
        //),
        vec3(0.5725, 0.6196, 0.9294),
        kw
    );
    float spec = pow(max(dot(ref, viewDir), 0.0), 64.0);
    //float diff = max(dot(n, lightDir), 0.0);
    float rim = (1.0 - front) * 0.7;

    return clamp(
        ambient +
        spec +
        rim,
        0.0, 1.0
    );

}

void main() {

    vec2 uv = gl_FragCoord.xy/u_resolution.y;
    vec3 col = vec3(1);

    //uv -= 0.5;
    uv *= rot2D(u_time * D2R);
    uv *= 3.0;
    uv.y += 0.2*u_time*sign(mod(floor(uv.x), 2.0) - 0.5);

    vec2 fpos = fract(uv) - 0.5;

    vec3 ro = vec3(50.0*fpos, -30);
    vec3 rd = vec3(0, 0, 1);

    //vec3 ro = vec3(0, 0, -50);
    //vec3 rd = normalize(vec3(fpos, 1));

    float d = march(ro, rd);

    sun.xz *= rot2D(u_time);

    if (d < MAX_DIST) {

        vec3 p = ro + rd*d;
        col = shade(ro, rd, p, fpos);

    }

    fragColor = vec4(col, 1);

}