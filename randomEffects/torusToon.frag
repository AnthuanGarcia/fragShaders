#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

out vec4 fragColor;

#define MAX_ITERS 64
#define MIN_DIST  0.0
#define MAX_DIST  64.0
#define EPSILON   1E-4

struct Light {

    vec3 pos;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    vec3 intensity;
    float shine;

} light1, light2;

float sphereSDF(vec3 point) {

    return length(point) - 1.0;

}

float torusSDF(vec3 p, vec2 t) {

    vec2 q = vec2(length(p.xz)-t.x, p.y);
    return length(q) - t.y;

}

float sceneSDF(vec3 point) {
    
    return torusSDF(point, vec2(1.0, 0.35));

}

vec3 rayDirection(float fov, vec2 size, vec2 pixCoor) {

    vec2 xy = pixCoor - size * 0.5;
    float z = size.y / tan( radians(fov)*0.5 );
    return normalize( vec3(xy, -z) );

}

float shortDistToSurface(vec3 eye, vec3 dir, float start, float end) {

    float depth = start;

    for (int i = 0; i < MAX_ITERS; i++) {

        float dist = sceneSDF(eye + depth*dir);

        if (dist < EPSILON)
            return depth;

        depth += dist;

        if (depth >= end)
            return end;

    }

    return end;

}

vec3 estimateNormal(vec3 p) {

    return normalize(vec3(
        sceneSDF(vec3(p.x + EPSILON, p.y, p.z)) - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)),
        sceneSDF(vec3(p.x, p.y + EPSILON, p.z)) - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)),
        sceneSDF(vec3(p.x, p.y, p.z  + EPSILON)) - sceneSDF(vec3(p.x, p.y, p.z - EPSILON))
    ));

}

vec3 phongContrib(inout Light l, vec3 p, vec3 eye) {

    vec3 N = estimateNormal(p);
    vec3 L = normalize(l.pos - p);
    vec3 V = normalize(eye - p);
    vec3 R = normalize(reflect(-L, N));

    float dotLN = dot(N, L);
    float dotRV = dot(R, V);

    if (dotLN < 0.0)
        return vec3(0);

    if (dotRV < 0.0)
        return l.intensity*l.diffuse*dotLN;

    return l.intensity * (l.diffuse*dotLN + l.specular*pow(dotRV, l.shine));

}

vec3 phongIlumation(inout Light light, vec3 p, vec3 eye) {

    const vec3 ambientLight = 0.5 * vec3(1);
    vec3 color = light.ambient * ambientLight;

    light.pos = vec3(4.0*cos(u_time), 3.0, 4.0*sin(u_time));
    light.intensity = vec3(0.45);

    color += phongContrib(light, p, eye);
    //color += light2.ambient * ambientLight;

    //light2.pos = vec3(-1.0, -2.0, 1.0);
    //light2.intensity = vec3(0.45);

    //color += phongContrib(light2, p, eye);

    return color;

}

mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {

    vec3 f = normalize(center - eye);
    vec3 s = normalize(cross(f, up));
    vec3 u = normalize(cross(s, f));

    return mat4(
        vec4(s, 0),
        vec4(u, 0),
        vec4(-f, 0),
        vec4(0, 0, 0, 1)
    );

}

#ifdef BUFFER_0

    void main() {

        vec3 dir = rayDirection(45.0, u_resolution, gl_FragCoord.xy);
        vec3 camera = vec3(8.0, 10.0, 8.0);

        mat4 viewToWorld = viewMatrix(camera, vec3(0), vec3(0, 1, 0));
        vec3 worldDir = (viewToWorld * vec4(dir, 0)).xyz;

        float dist = shortDistToSurface(camera, worldDir, MIN_DIST, MAX_DIST);

        vec3 p = camera + dist*worldDir;
        float noHit = step(dist, MAX_DIST - EPSILON);

        vec3 col = vec3(0.87);

        light1.ambient = vec3(0.3098, 0.1176, 0.0);
        light1.diffuse = vec3(1.0, 0.0, 0.6157);
        light1.specular = vec3(1.0, 0.8667, 0.0);
        light1.shine = 8.0;

        col = mix(
            col,
            phongIlumation(light1, p, camera), 
            noHit
        );

        fragColor = vec4(col, 1);

    }

#else

    void main() {
        
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float uResS = 200.0;
        float uResT = 200.0;
        float uMagTol = 0.95;
        float uQuantize = 5.50;

        ivec2 ires = textureSize( u_buffer0, 0 );
        float ResS = float( ires.s );
        float ResT = float( ires.t );

        vec3 irgb = texture( u_buffer0, uv ).rgb;
        vec3 brgb = texture( u_buffer0, uv ).rgb;
        vec3 argb = texture( u_buffer0, uv ).rgb;
        vec3 rgb  = texture( u_buffer0, uv ).rgb;

        vec2 stp0 = vec2(1./uResS, 0. );
        vec2 st0p = vec2(0. , 1./uResT);
        vec2 stpp = vec2(1./uResS, 1./uResT);
        vec2 stpm = vec2(1./uResS, -1./uResT);

        const vec3 W = vec3( 0.2125, 0.7154, 0.0721 );
        float i00  = dot( texture( u_buffer0, uv).rgb, W );
        float im1m1= dot( texture( u_buffer0, uv-stpp ).rgb, W );
        float ip1p1= dot( texture( u_buffer0, uv+stpp ).rgb, W );
        float im1p1= dot( texture( u_buffer0, uv-stpm ).rgb, W );
        float ip1m1= dot( texture( u_buffer0, uv+stpm ).rgb, W );
        float im10 = dot( texture( u_buffer0, uv-stp0 ).rgb, W );
        float ip10 = dot( texture( u_buffer0, uv+stp0 ).rgb, W );
        float i0m1 = dot( texture( u_buffer0, uv-st0p ).rgb, W );
        float i0p1 = dot( texture( u_buffer0, uv+st0p ).rgb, W );

        // next two lines apply the H and V Sobel filters at the pixel
        float h= -1.*im1p1-2.*i0p1-1.*ip1p1+1.*im1m1+2.*i0m1+1.*ip1m1;
        float v= -1.*im1m1-2.*im10-1.*im1p1+1.*ip1m1+2.*ip10+1.*ip1p1;
        float mag = length( vec2( h, v ) ); // how much change

        vec3 col;

        // is there?
        if( mag > uMagTol ) {
            // if too much, use black
            col = vec3(0);

        } else { // else quantize the color

            rgb *= uQuantize;
            rgb += vec3( .5, .5, .5 ); // round
            ivec3 intrgb = ivec3( rgb ); // truncate
            rgb = vec3( intrgb ) / uQuantize;
            col = rgb;

        }

        fragColor = vec4( col, 1. );

    }

#endif