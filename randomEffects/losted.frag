#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define MAX_STEPS 40
//#define MAX_STEPS 128
#define MIN_DIST  0.0
#define MAX_DIST  16.0
//#define MAX_DIST  64.0
#define LIM_VAL   1E-4

#define ORTOGRAPHIC 01

#define PAL20 vec3(0.275, 0.584, 0.823), vec3(0.869, 0.354, 0.288), vec3(0.479, 0.461, 0.015), vec3(4.714, 3.884, 5.150)
#define PAL25 vec3(1.158, 0.200, 0.758), vec3(0.138, 0.538, 0.233), vec3(1.135, -0.392, 0.898), vec3(2.188, 2.333, 3.195)
#define PAL16 vec3(0.650, 0.500, 0.310), vec3(-0.650, 0.500, 0.600), vec3(0.333, 0.278, 0.278), vec3(0.660, 0.000, 0.667)

#define D2R 0.0174532925

#define battery (sin(u_time)*0.5 + 0.5)

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b*cos( 6.283185*(c*t + d) );
}

mat2 rot2D(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, s, -s, c);
}

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

float smoothNoise(vec2 n) {

    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(noise(b), noise(b + d.yx), f.x), mix(noise(b + d.xy), noise(b + d.yy), f.x), f.y);

}

float octahedron(vec3 p, float s) {

    p = abs(p);
    float m = p.x + p.y + p.z - s;
    vec3 r = 3.0*p - m;

    vec3 q;
         if( r.x < 0.0 ) q = p.xyz;
    else if( r.y < 0.0 ) q = p.yzx;
    else if( r.z < 0.0 ) q = p.zxy;
    else return m*0.57735027;

    float k = clamp(0.5*(q.z-q.y+s),0.0,s);

    return length(vec3(q.x,q.y-s+k,q.z-k)); 

}

float cube(vec3 p, float s) {
    p = abs(p);
    return max(p.x, max(p.y, p.z)) - s;
}

float sphere(vec3 p, float r) {
    return length(p) - r;
}

float sdCylinder( vec3 p, vec3 c )
{
  return length(p.xz-c.xy)-c.z;
}

float scene(vec3 p) {

    //float d = (sin(p.x + u_time)*tanh(p.y + u_time)*cos(p.z + u_time));
    p.yz *= rot2D(u_time);
    p.xz *= rot2D(u_time);
    p.xy *= rot2D(u_time);

    float k = sin(u_time);

    mat2 m = rot2D(k*p.y);
    vec3 q = vec3(m*p.xz, p.y);

    return octahedron(q, 1.0) - 0.1;

}

float sceneRefract(vec3 p) {

    p.yz *= rot2D(u_time);
    p.xy *= rot2D(u_time);
    p.xz *= rot2D(u_time);

    float k = 0.25;

    mat2 m = rot2D(k*p.x);
    vec3 q = vec3(m*p.yz, p.x);

    return octahedron(q, 2.0) - 0.1;

}

float march(vec3 ro, vec3 rd, bool refra) {

	float precis = LIM_VAL;
    float h = precis*2.0;
	float md = 1.0;
	float d = MIN_DIST;

	for (int i = 0; i < MAX_STEPS; i++) {

		if( abs(h) < precis || d >= MAX_DIST )
        {
			break;
        }

        d += h;
        vec3 pos = ro + d*rd;

        if (refra) {
		    h = sceneRefract(pos);
        } else {
            h = scene(pos);
        }

	}

	return d;

}

vec3 getNormal(vec3 p) {

	const float h = LIM_VAL;
	const vec2 k = vec2(1,-1);

    return normalize(
		k.xyy*scene( p + k.xyy*h ) + 
    	k.yyx*scene( p + k.yyx*h ) + 
        k.yxy*scene( p + k.yxy*h ) + 
        k.xxx*scene( p + k.xxx*h )
	);

}

vec3 getNormal2(vec3 p) {

	const float h = LIM_VAL;
	const vec2 k = vec2(1,-1);

    return normalize(
		k.xyy*sceneRefract( p + k.xyy*h ) + 
    	k.yyx*sceneRefract( p + k.yyx*h ) + 
        k.yxy*sceneRefract( p + k.yxy*h ) + 
        k.xxx*sceneRefract( p + k.xxx*h )
	);

}

vec3 sun = vec3(100, 200, -100);

void shade(vec3 ro, vec3 rd, vec3 pos, inout vec3 col) {

    vec3 n = getNormal(pos);
    vec3 lightDir = normalize(sun - pos);
    vec3 viewDir  = normalize(ro - pos);
    vec3 reflLight = normalize(reflect(-lightDir, n));

    float N = dot(n, lightDir);

    float diff = max( N, 0.0 );
    float spec = pow(max( dot(viewDir, reflLight), 0.0), 64.0);
    float rimC = 1.0 - dot(viewDir, n);

    float kw  = (1.0 + N) * 0.5;

    //vec3 col1 = vec3(0.0118, 0.5373, 0.9686);
    //vec3 col2 = vec3(0.5686, 0.3373, 0.8314);

    vec3 dirCol = mix(
        palette(kw, PAL25),
        palette(kw, PAL20),
        palette(0.3, PAL16)
    );

    rimC = pow(rimC, 2.75);

    vec3 ambient = dirCol;
    vec3 diffuse = vec3(0.1) * diff;
    vec3 specular = vec3(1) * spec;
    vec3 rim      = vec3(0.35) * rimC;

    vec3 color = ambient + diffuse + specular + rim;

    col = mix(col, clamp(color, 0.0, 1.0), 1.0);

}

void shade2(vec3 ro, vec3 rd, vec3 pos, inout vec3 col) {


    vec3 n = getNormal2(pos);

    vec3 lightDir = normalize(sun - ro);
    vec3 viewPos = normalize(ro - pos);

    float rim = 1.0 - dot(viewPos, n);
    float ndotl = abs(dot( -rd, n ));

    float N = dot(n, lightDir);
    float kw  = (1.0 + N) * 0.5;

    //vec3 col1 = vec3(0.2157, 0.102, 0.8588);
    //vec3 col2 = vec3(0.9294, 0.349, 0.7569);

    vec3 dirCol = palette(kw, PAL20);

    //col = mix( refract(n, rd, 0.5)*0.5+vec3(0.5), col, rim );;

    col = mix(
        col,
        dirCol + 
        ndotl*0.1 + 
        rim*0.1,
    N * 0.5);

    vec3 ref = refract(rd, n, 0.9);
    float d = march(ro, ref, false);

    if (d < MAX_DIST) {

        //col -= mix( refract(n, ref, 0.5)*0.5+vec3(0.5), col, rim);
        vec3 rpos = ro + ref*d;
        shade(ro, ref, rpos, col);
    
    }
}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= ASPECT;

    //uv = (uv * 1.0) - 0.5;
    vec2 fpos = fract(uv * 5.0) - 0.5;

#if ORTOGRAPHIC
    vec3 ro = vec3(uv*2.5, -2);
    vec3 rd = vec3(0, 0, 1);
#else
    vec3 ro = vec3(0, 0, -3.0);
    vec3 rd = normalize(vec3(uv, 1));
#endif

    vec3 col = vec3(0.9255, 0.7294, 0.9216);

    //col = vec3(0, 0, 0);

    float d = march(ro, rd, true);

    if (d < MAX_DIST) {

        vec3 pos = ro + rd*d;
        shade2(ro, rd, pos, col);

    }

    col = sqrt(col);
    fragColor = vec4(col, 1.0);

}