#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define MAX_ITERS 100
#define MAX_DIST  100.0
#define SURF_DIST 1E-2

vec3 LIGHT_POS = vec3(0, 5, 6);

float GetDist(vec3 p) {

    vec4 s = vec4(0, 1.5, 6, 1);

    float sphereDist = length(p - s.xyz) - s.w;
    float planeDist = p.y;

    return min(sphereDist, planeDist);

}

float RayMarch(vec3 ro, vec3 rd) {

    float d0 = 0.0;
    
    for (int i = 0; i < MAX_ITERS; i++) {

        vec3 p = ro + rd*d0;
        float ds = GetDist(p);

        d0 += ds;

        if ( d0 > MAX_DIST || ds < SURF_DIST ) 
            break;

    }

    return d0;

}

vec3 GetNormal(vec3 p) {

    float d = GetDist(p);
    vec2 aux = vec2(0.01, 0);

    vec3 n = d - vec3(
        GetDist(p - aux.xyy),
        GetDist(p - aux.yxy),
        GetDist(p - aux.yyx)
    );

    return normalize(n);
    //return d - normalize(n);

}

float GetLight(vec3 p) {

    LIGHT_POS.xz += vec2(cos(u_time), sin(u_time)) * 2.;

    vec3 l = normalize(LIGHT_POS - p);
    vec3 n = GetNormal(p);

    float diffuse = clamp(
        dot( n, l ), 0.0, 1.0
    );

    float d = RayMarch(p + n*SURF_DIST*2.0, l);

    if ( d < length(LIGHT_POS - p) ) 
        diffuse *= 0.1;

    return diffuse;

}

void main() {

    vec2 uv = (gl_FragCoord.xy/u_resolution) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0);

    vec3 camera = vec3(0, 01, 0);
    vec3 rayDirection = normalize( vec3(uv, 1) );

    float d = RayMarch(camera, rayDirection);
    vec3 p = camera + rayDirection*d;

    float diffuse = GetLight(p);

    col += diffuse * vec3(0.85);

    gl_FragColor = vec4(col, 1.0);

}