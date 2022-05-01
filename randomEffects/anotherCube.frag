#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

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

} light1;

float cubeSDF(vec3 point) {

    vec3 d = abs(point) - vec3(1);
    float insideDist = min(max(d.x, max(d.y, d.z)), 0.0);
    float outsideDist = length(max(d, 0.0));

    return insideDist + outsideDist;

}

float sceneSDF(vec3 point) {

    return cubeSDF(point);

}

vec3 rayDirection(float fov, vec2 size, vec2 pixCoor) {

    vec2 xy = pixCoor - size * 0.5;
    float z = size.y / ( radians(fov)*0.5 );
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

const mat4 orthoProjection = mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 1
);

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

mat4 orthoProj(float right, float left, float top, float bottom, float far, float near) {

    return mat4(
        2.0 / (right-left), 0, 0, -( (right+left) / (right-left) ),
        0, 2.0 / (top-bottom),   0, -( (top+bottom) / (top-bottom) ),
        0, 0, -2.0 / (far-near),  -( (far+near) / (far-near) ),
        0, 0, 0, 1
    );

}

void main() {

    vec3 dir = rayDirection(45.0, u_resolution, gl_FragCoord.xy);
    vec3 camera = vec3(7.0, 7.0, 7.0);
    //vec3 camera = vec3(0., 0.0, 0.0);

    mat4 viewToWorld = viewMatrix(camera, vec3(0), vec3(0, 1, 0));
    vec3 worldDir = (viewToWorld * vec4(dir, 0)).xyz;

    float dist = shortDistToSurface(camera, worldDir, MIN_DIST, MAX_DIST);

    vec3 p = camera + dist*worldDir;
    float noHit = step(dist, MAX_DIST - EPSILON);

    vec3 col = vec3(0, 0, 1);

    light1.ambient = vec3(0.0, 1.0, 0.7176);
    light1.diffuse = vec3(0.5922, 0.7647, 0.9804);
    light1.specular = vec3(1.0, 1.0, 1.0);
    light1.shine = 12.0;

    col = mix(
        col,
        phongIlumation(light1, p, camera),
        noHit
    );

    gl_FragColor = vec4(col, 1);

}