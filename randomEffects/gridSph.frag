#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define AA 2
#define ASPECT u_resolution.x / u_resolution.y
#define RX 1.0 / min(u_resolution.x, u_resolution.y)

#define PI     3.14159265
#define TWO_PI 6.283185

#define RADIUS 0.175
#define ZOOM 3.0

#define CIRCLE(r, p) length(p) - abs(r)

#define TEXTURING 01

vec3 centerSph = vec3(0, 0, 0.5);

struct Light {

    vec3 pos;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    vec3 intensity;
    float shine;

} L;

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

mat2 rot2D(float angle) {

	float s = sin(angle);
	float c = cos(angle);

	return mat2(
		c, -s,
		s, c
	);

}

vec3 yaw(vec3 p, vec3 a) {

	p.xz *= rot2D(a.y);
	return p;

}

vec3 rotate(vec3 p, vec3 a) {

	p.yz *= rot2D(a.x);
	p.xz *= rot2D(a.y);
	p.xy *= rot2D(a.z);

	return p;

}

// sphere of size ra centered at point ce
float sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
{

    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;

    return h < 0.0 ? -1.0 : -b - sqrt( h );

}

const float N = 20.0; // grid ratio
float gridTextureGradBox( in vec2 p, in vec2 ddx, in vec2 ddy )
{
	// filter kernel
    vec2 w = max(abs(ddx), abs(ddy)) + 0.01;

	// analytic (box) filtering
    vec2 a = p + 0.5*w;                        
    vec2 b = p - 0.5*w;           
    vec2 i = (floor(a)+min(fract(a)*N,1.0)-
              floor(b)-min(fract(b)*N,1.0))/(N*w);
    //pattern
    return (1.0-i.x)*(1.0-i.y);
}

float gridTexture( in vec2 p )
{
    // coordinates
    vec2 i = step( fract(p), vec2(1.0/N) );
    //pattern
    return (1.0-i.x)*(1.0-i.y);   // grid (N=10)
    
    // other possible patterns are these
    //return 1.0-i.x*i.y;           // squares (N=4)
    //return 1.0-i.x-i.y+2.0*i.x*i.y; // checker (N=2)
}

float a(vec2 p, float t) {

	return max(plot(fract(p.y), t), 0.);

}

vec3 phong(inout Light l, vec3 pos, vec3 ro) {

	vec3 N = normalize(pos - centerSph);
	vec3 L = normalize(l.pos - pos);
    vec3 V = normalize(ro - pos);
    vec3 R = normalize(reflect(-L, N));

	float dotLN = dot(N, L);
    float dotRV = dot(R, V);

	if (dotLN < 0.0)
        return vec3(0);

    if (dotRV < 0.0)
        return l.intensity*l.diffuse*dotLN;

    return l.intensity * (l.diffuse*dotLN + l.specular*pow(dotRV, l.shine));

}

void main() {

	L.ambient = vec3(1.0, 1.0, 1.0);
    L.diffuse = vec3(0.7961, 0.2784, 0.9529);
    L.specular = vec3(0.75);
    L.shine = 20.0;
	//L.pos = vec3(4.0*cos(u_time), 3.0, 4.0*sin(u_time));
	L.pos = vec3(0.25);
	L.intensity = vec3(0.5);

	vec3 backCol;
	vec3 col;

	vec2 uv2;

	vec2 fpos, ipos;

	vec3 r  = vec3(u_time);
	vec3 ro = vec3(0);
	//vec3 rd;
	//vec3 r  = vec3(1.4);
	//vec3 rd = normalize( vec3(uv - 0.5, 1.0) );

	ro -= centerSph;
	ro = rotate(ro, r);
	ro += centerSph;

	vec3 tot = vec3(0.0);

#if AA >= 1
	for( int m=0; m<AA; m++ )
    for( int n=0; n<AA; n++ )
    {
        // pixel coordinates
    	vec2 o = vec2(float(m),float(n)) / float(AA) - 0.5;
        vec2 uv = (2.0*(gl_FragCoord.xy+o)-u_resolution.xy)/u_resolution.y;

		uv -= 1.0;

		uv.x += 0.25*u_time;
		uv2 = ((uv+1.0)*ZOOM);
		uv.x -= 0.25*u_time;

		fpos = fract(uv*ZOOM*0.5);
		ipos = floor(uv*ZOOM*0.5);

#else

		vec2 uv = gl_FragCoord.xy / u_resolution;
		uv.x *= ASPECT;

		uv.x += 0.25*u_time;
		uv2 = ((uv-0.5) * ZOOM * 2.0);
		uv.x -= 0.25*u_time;

		fpos = fract(uv * ZOOM);
		ipos = floor(uv * ZOOM);

#endif

		vec3 rd = normalize( vec3(fpos - 0.5, 1.0) );

		rd = rotate(rd, r);

		float t = sphIntersect(ro, rd, centerSph, RADIUS);
		vec3 pos = ro + rd*t;

		float id = noise(ipos);

#if TEXTURING

		vec3 nor = normalize(pos - centerSph);
		vec2 texCoord = vec2( atan(nor.x, nor.z), acos(nor.y) ) * RADIUS;

		texCoord *= 30.0;

		if (id < 0.5)
			col = vec3(1) - a(texCoord - 0.3, 0.5);
		else
			col = vec3(1) - a(texCoord.yx - 0.3, 0.5);

#else
		col = vec3(0.4275, 0.3176, 0.749) + phong(L, pos, ro);
#endif

		backCol = vec3(1) - plot((uv2.y - sin(uv2.x)), 0.025);

		col = mix(
			col,
			backCol,
			step(t, 0.0) // hit?
		);

		tot += col;

#if AA >= 1
	}

	tot /= float(AA*AA);
#endif

	fragColor = vec4(tot, 1);

}