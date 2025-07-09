#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define MAX_STEPS 64
//#define MAX_STEPS 128
#define MIN_DIST  0.0
#define MAX_DIST  32.0
//#define MAX_DIST  64.0
#define LIM_VAL   1E-4

#define ORTOGRAPHIC 0
#define RECT_SIZE 2.0

#define D2R 0.0174532925
#define PI 3.14159265

mat2 rot2D(float angle) {
	float s = sin(angle), c = cos(angle);
	return mat2(c, s, -s, c);
}

float sdCylinder( vec3 p, vec3 c )
{
	return length(p.xz-c.xy)-c.z;
}


float torus(vec3 p,vec2 t){
    vec2 q=vec2(length(p.xz)-t.x,p.y);
    return length(q)-t.y;
}

float scene(vec3 p) {
	vec3 q = p;
    q.xy *= rot2D(90.0 * D2R);
	//q.yz *= rot2D(90.0 * D2R);

	q.y += (cos(q.z * 2.0 + u_time) * 0.8);
    return -torus(q, vec2(2.0, 1.0));
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

float march(vec3 ro, vec3 rd) {

	float precis = 0.001;
    float h = precis*2.0;
	float md = 1.0;
	float d = MIN_DIST;

	for (int i = 0; i < MAX_STEPS; i++) {

		if( abs(h) < precis || d >= MAX_DIST )
			break;

        d += h;
		h = scene(ro + d*rd);

	}

	return d;

}

vec3 shade(vec3 pos) {
	vec3 sun = vec3(cos(u_time)*100.0, 150, sin(u_time)*100.0);
	vec3 lightDir = normalize(sun - pos);
	vec3 n = getNormal(pos);
	
	float diffuse = max(dot(lightDir, n), 0.0);

	return vec3(0.3804, 0.3373, 0.5333) + vec3(0.8824, 0.6941, 0.0196)*diffuse;
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

    vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
    vec3 col = vec3(1);

	uv.x *= ASPECT;

#if ORTOGRAPHIC
	vec3 ro = vec3(RECT_SIZE*uv, -1);
	vec3 rd = vec3(0, 0, 1);
#else
	vec3 ro = vec3(0, 2, -1.0);
	//vec3 ro = vec3(0.0, 0, -9);
	vec3 rd = normalize(vec3(uv, 1));
#endif

	float t = march(ro, rd);

	//if (t < MAX_DIST) {
	vec3 pos = ro + rd*t;

    vec3 n = getNormal(pos);
    
    vec2 visionAngles = vec2(
        atan(pos.z, pos.y),
        atan(pos.x, length(pos.yz))
    );
    
    vec2 st = vec2(
        visionAngles.x / PI * 0.5,
        visionAngles.y / PI
    );
    
    st *= 50.0;
    st.x += sin(st.y + u_time);
	col = vec3(1.0) * gridTexture(st.xx);
	//col = shade(pos);
	//}

    fragColor = vec4(col, 1);

}
