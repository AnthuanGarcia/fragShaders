#version 300 es

precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

#define ORTOGRAPHIC 0
#define RECT_SIZE   3.0

#define MAX_STEPS 64
#define MAX_DIST  16.0
#define MIN_DIST  0.0
#define LIM_VAL   1E-4

#define PI 3.14159265
#define DEG2RAD 0.0174532925

out vec4 fragColor;

mat2 rot2D(float angle) {

    float s = sin(angle);
    float c = cos(angle);

    return mat2(
        c, -s,
        s, c
    );

}

float pReflect(inout vec3 p, vec3 planeNormal, float offset) {
    float t = dot(p, planeNormal)+offset;
    if (t < 0.) {
        p = p - (2.*t)*planeNormal;
    }
    return sign(t);
}

int Type = 5;

vec3 nc,pab,pbc,pca;

void initIcosahedron() {//setup folding planes and vertex
    float cospin=cos(PI/float(Type)), scospin=sqrt(0.75-cospin*cospin);
	nc=vec3(-0.5,-cospin,scospin);//3rd folding plane. The two others are xz and yz planes
	pab=vec3(0.,0.,1.);
	pbc=vec3(scospin,0.,0.5);//No normalization in order to have 'barycentric' coordinates work evenly
	pca=vec3(0.,scospin,cospin);
	pbc=normalize(pbc);	pca=normalize(pca);//for slightly better DE. In reality it's not necesary to apply normalization :) 
}

// Barycentric to Cartesian 
vec3 bToC(vec3 A, vec3 B, vec3 C, vec3 barycentric) {
	return barycentric.x * A + barycentric.y * B + barycentric.z * C;
}

vec3 pModIcosahedron(inout vec3 p, int subdivisions) {
    p = abs(p);
	pReflect(p, nc, 0.);
    p.xy = abs(p.xy);
	pReflect(p, nc, 0.);
    p.xy = abs(p.xy);
	pReflect(p, nc, 0.);
    
    /*if (subdivisions > 0) {

        vec3 A = pbc;
       	vec3 C = reflect(A, normalize(cross(pab, pca)));
        vec3 B = reflect(C, normalize(cross(pbc, pca)));
       
        vec3 n;

        // Fold in corner A 
        
        vec3 p1 = bToC(A, B, C, vec3(.5, .0, .5));
        vec3 p2 = bToC(A, B, C, vec3(.5, .5, .0));
        n = normalize(cross(p1, p2));
        pReflect(p, n, 0.);
        
        if (subdivisions > 1) {

            // Get corners of triangle created by fold

            A = reflect(A, n);
            B = p1;
            C = p2;
            
            // Fold in corner A

            p1 = bToC(A, B, C, vec3(.5, .0, .5));
            p2 = bToC(A, B, C, vec3(.5, .5, .0));
            n = normalize(cross(p1, p2));
            pReflect(p, n, 0.);
            

            // Fold in corner B
            
			p2 = bToC(A, B, C, vec3(.0, .5, .5));
            p1 = bToC(A, B, C, vec3(.5, .5, .0));
            n = normalize(cross(p1, p2));
            pReflect(p, n, 0.);
        }
    }*/

    return p;
}

float fPlane(vec3 p, vec3 n, float distanceFromOrigin) {
    return dot(p, n) + distanceFromOrigin;
}

float face(vec3 p) {
    float d = 1000.;
    float part;

    part = fPlane(p, pca, -1.4);
    d = min(d, part);

    part = length(p - pca * 1.4) - 0.02;
    d = min(d, part);

    return d;
}

float scene(vec3 p) {

    vec3 pp = p;

    pp.yz *= rot2D(-30.0 * DEG2RAD);
    pp.xz *= rot2D(u_time);

    //pp -= vec3(1.5,0,3.3);
	pModIcosahedron(pp, 0);

    float sph = length(p) - 1.5;

	//return max(face(pp), sph);
    return face(pp);
}

float march(vec3 ro, vec3 rd) {

    float precis = LIM_VAL;
    float h = 2.0 * precis;
    float d = MIN_DIST;

    for (int i = 0; i < MAX_STEPS; i++) {

        if (abs(h) < precis || d >= MAX_DIST) break;

        h = scene(ro + rd*d);
        d += h;

    }

    return d;

}

vec3 getNormal(vec3 p) {

    const vec2 h = vec2(0, LIM_VAL);

    return normalize(
        vec3(
            scene(p + h.yxx) - scene(p - h.yxx),
            scene(p + h.xyx) - scene(p - h.xyx),
            scene(p + h.xxy) - scene(p - h.xxy)
        )
    );
    
}

vec3 sun = vec3(100, 200, -100);

vec3 shade(vec3 ro, vec3 p) {

    vec3 n = getNormal(p);
    vec3 lightDir = normalize(sun - p);
    vec3 viewDir  = normalize(ro - p);
    vec3 reflLight = normalize(reflect(-lightDir, n));

    float N = dot(n, lightDir);

    float diff = max( N, 0.0 );
    float spec = pow(max( dot(viewDir, reflLight), 0.0), 64.0);
    float rimC = 1.0 - dot(viewDir, n);

    float kw  = (1.0 + N) * 0.5; // f : [-1, 1] -> [0, 1]

    vec3 col1 = vec3(0.9333, 0.5059, 0.7176);
    vec3 col2 = vec3(0.9294, 0.6588, 0.349);

    vec3 dirCol = mix(col1, col2, kw);

    rimC = pow(rimC, 2.75);

    vec3 ambient = dirCol;
    vec3 diffuse = vec3(0.2) * diff;
    vec3 specular = vec3(1) * spec;
    vec3 rim      = vec3(0.35) * rimC;

    vec3 col = ambient + diffuse + specular + rim;

    return clamp(col, 0.0, 1.0);

}

void main() {

    initIcosahedron();

    vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

#if ORTOGRAPHIC

    vec3 ro = vec3(uv*RECT_SIZE, -3);
    vec3 rd = vec3(0, 0, 1);

#else

    vec3 ro = vec3(0, 0, -3);
    vec3 rd = normalize(vec3(uv, 1));

#endif

    float t = march(ro, rd);
    float hit = step(t, MAX_DIST - LIM_VAL);

    vec3 col = mix(
        vec3(0.9608, 0.8667, 0.7647),
        vec3(0.95),
        -uv.y * 0.5 + 0.5
    );

    col = mix(
        col,
        shade(ro, ro + rd*t),
        hit
    );

    fragColor = vec4(col, 1);

}