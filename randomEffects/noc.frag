#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define MAX_DIST 8.
#define MIN_DIST 0.
#define STEPS 40
#define LIM_VAL 1E-4

#define D2R.01745
#define PI 3.14159265

#define PAL16 vec3(.650,.500,.310),vec3(-.650,.500,.600),vec3(.333,.278,.278),vec3(.660,0.,.667)
#define PAL24 vec3(1.158,.408,.758),vec3(.138,.538,.233),vec3(1.135,-.352,.898),vec3(3.787,2.368,3.195)
#define REFPAL vec3(1.158,.200,.758),vec3(.138,.538,.233),vec3(1.135,-.392,.898),vec3(2.188,2.333,3.195)
#define PAL9 vec3(.376,.777,.959),vec3(.501,.477,.745),vec3(.228,.161,.014),vec3(3.083,1.247,.834)

mat2 rot2D(float angle){
    float s=sin(angle),c=cos(angle);
    return mat2(c,-s,s,c);
}

vec3 palette(in float t,in vec3 a,in vec3 b,in vec3 c,in vec3 d){
    
    return a+b*cos(6.283185*(c*t+d));
    
}

float torus(vec3 p,vec2 t){
    vec2 q=vec2(length(p.xz)-t.x,p.y);
    return length(q)-t.y;
}

float noise(vec3 p){
    return fract(sin(p.x*10.+p.y*1234.5+p.z*7890.123)*5647.);
}

float noise(vec2 p){
    return fract(sin(p.x*10.+p.y*1234.5)*5647.);
}

float noise(float p){
    return fract(sin(10.+p*1234.5)*5647.);
}

vec3 random3(vec3 c){
    float j=4096.*sin(dot(c,vec3(17.,59.4,15.)));
    vec3 r;
    r.z=fract(512.*j);
    j*=.125;
    r.x=fract(512.*j);
    j*=.125;
    r.y=fract(512.*j);
    return r-.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

float simplex3D(vec3 p)
{
    
    /* 1. find current tetrahedron T and it's four vertices */
    /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
    /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
    
    /* calculate s and x */
    vec3 s = floor(p + dot(p, vec3(F3)));
    vec3 x = p - s + dot(s, vec3(G3));
    
    /* calculate i1 and i2 */
    vec3 e = step(vec3(0.0), x - x.yzx);
    vec3 i1 = e*(1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy*(1.0 - e);
    
    /* x1, x2, x3 */
    vec3 x1 = x - i1 + G3;
    vec3 x2 = x - i2 + 2.0*G3;
    vec3 x3 = x - 1.0 + 3.0*G3;
    
    /* 2. find four surflets and store them in d */
    vec4 w, d;
    
    /* calculate surflet weights */
    w.x = dot(x, x);
    w.y = dot(x1, x1);
    w.z = dot(x2, x2);
    w.w = dot(x3, x3);
    
    /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
    w = max(0.6 - w, 0.0);
    
    /* calculate surflet components */
    d.x = dot(random3(s), x);
    d.y = dot(random3(s + i1), x1);
    d.z = dot(random3(s + i2), x2);
    d.w = dot(random3(s + 1.0), x3);
    
    /* multiply d by w^4 */
    w *= w;
    w *= w;
    d *= w;
    
    /* 3. return the sum of the four surflets */
    return dot(d, vec4(52.0));
    
}

float fbm2(vec3 p)
{
    float f;
    f  = 0.25*simplex3D( p + 0.5*u_time ); //p = p*2.01;
    //f += 0.25000*simplex3D( p - 0.25*u_time ); p = p*2.02;
    //f += 0.12500*simplex3D( p ); p = p*2.03;
    //f += 0.06250*simplex3D( p ); p = p*2.04;
    //f += 0.03125*simplex3D( p );
    return f*0.5+0.5;
}

float noiseDist(vec3 p) {
    p = p / 0.8;
    return (fbm2(p) - 0.5) * 1.5;
}

float sphere(vec3 p, float r) {
    return length(p) - r;
}

float sdCylinder( vec3 p, vec3 c ) {
    return length(p.xz-c.xy)-c.z;
}

float opSmoothUnion( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float map(vec3 p) {
    
    vec3 q = p*1.5;
    vec3 v = p;
    //p.y += 2.;
    
    p.xy *= rot2D(90.0 * D2R);
    //p.yz *= rot2D(90.0 * D2R);
    //p.yz *= rot2D(u_time);
    q.yz *= rot2D(u_time * 0.75);
    v.yz *= rot2D(u_time * 0.75);
    
    //v.yz *= rot2D(90.0 * D2R);
    float scale = 1.4;
    v.yz += u_time * 0.5;
    v.x += 0.5;
    
    vec3 iv = floor(v / scale);
    float idz = noise(iv.z);
    
    v.z *= step(0.4, idz);
    v.xy *= rot2D(PI * idz);
    
    //vec3 domainRep = v - c*round(v/c);
    vec3 domainRep = (fract(v/scale)-0.5)*scale;
    float cyls = sphere(domainRep, 0.2);
    
    float noi = noiseDist(q);
    
    return opSmoothUnion(-torus(p, vec2(2.0, 1.0)), cyls, .75) + noi;
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
    
    vec2 h = vec2(LIM_VAL, 0);
    
    return normalize(
        vec3(
            map(p + h.xyy) - map(p - h.xyy),
            map(p + h.yxy) - map(p - h.yxy),
            map(p + h.yyx) - map(p - h.yyx)
        )
    );
    
}

vec3 shade(vec3 pos, vec3 ro) {
    
    vec3 sun = vec3(0, 1.75, -1.);
    vec3 n = getNormal(pos);
    
    vec3 lightDir = normalize(sun - pos);
    vec3 viewPos = normalize(ro - pos);
    vec3 reflectDir = normalize(reflect(-lightDir, n));
    float front = max(dot(viewPos, n), 0.0);
    
    float spec = pow( max( dot(viewPos, reflectDir), 0.0 ), 64.0);
    float diff = max(dot(n, lightDir), 0.0);
    float rim = (1.0 - front);
    
    float inter = pos.z * 0.3 + u_time * 0.4;

    vec3 col = //mix(
        palette(inter, PAL16);
        //palette(inter, PAL16),
        //sin(u_time * 0.25) * 0.5 + 0.5
    //);
    
    return clamp(
        col * vec3(0.9, 1, 0.9) +
        //diff * 0.1 +
        //rim * 0.1 +
        front * 0.1 * vec3(0, 1, 0) +
        spec * 0.1,
        0.0,
        1.0
    );
    
}

float gridTexture( in vec2 p )
{
    // coordinates
    vec2 i = step( fract(p), vec2(1.0/20.0) );
    //pattern
    return (1.0-i.x)*(1.0-i.y);   // grid (N=10)
    
    // other possible patterns are these
    //return 1.0-i.x*i.y;           // squares (N=4)
    //return 1.0-i.x-i.y+2.0*i.x*i.y; // checker (N=2)
}

void main() {
    
    vec2 uv = 2.0*(gl_FragCoord.xy/u_resolution) - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    #if 0
    
    vec3 ro = vec3(uv, -1);
    vec3 rd = vec3(0, 0, 1);
    
    #else
    
    vec3 ro = vec3(-0., 1.5, -2.0);
    //vec3 ro = vec3(-0., 0, -2.0);
    //vec3 ro = vec3(0, 0, -6);
    vec3 rd = normalize(vec3(uv, 1));

    ro += vec3(cos(u_time), sin(u_time), 0) * 0.3;
    
    #endif
    
    vec3 col;
    
    float d = march(ro, rd);
    vec3 pos = ro + rd*d;
    /*vec3 n = getNormal(pos);
    
    vec2 visionAngles = vec2(
        atan(pos.z, pos.y),
        atan(pos.x, length(pos.yz))
    );
    
    vec2 st = vec2(
        visionAngles.x / PI * 0.5,
        visionAngles.y / PI
    );
    
    
    st *= 50.0;
    st += u_time;*/
    
    col=shade(pos,ro);
    //
    
    fragColor=vec4(col,1);
    
}