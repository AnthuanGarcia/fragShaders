#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)

#define ORTOGRAPHIC 01
#define RECT_SIZE 1.0

#define DEG2R 0.01745329
#define TWO_PI 6.283185

#define RT vec2(u_time, 0)

#define PAL1 vec3(0.498, 0.448, 1.170), vec3(0.918, 1.028, 0.308), vec3(0.498, 0.490, 0.220), vec3(2.420, -1.637, 0.527)
#define PAL2 vec3(0.530, 0.787, 0.485), vec3(0.420, 0.089, 0.758), vec3(0.133, 0.924, 0.008), vec3(4.820, 4.553, 2.869)
#define PAL3 vec3(0.300, 0.500, 0.357), vec3(0.698, 0.468, 0.299), vec3(0.768, 1.257, 1.503), vec3(2.824, 3.537, 3.216)

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( TWO_PI*(c*t + d) );

}

vec3 rayDirection(float fov, vec2 size, vec2 pixCoor) {

    vec2 xy = pixCoor - size * 0.5;
    float z = size.y / ( radians(fov)*0.5 );
    return normalize( vec3(xy, -z) );

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

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

mat2 rot2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, -s,
        s, c
    );

}

vec3 rotate(vec3 p, vec3 a) {

	p.yz *= rot2D(a.x);
	p.xz *= rot2D(-a.y);
	p.xy *= rot2D(a.z);

	return p;

}

vec2 boxIntersection( in vec3 ro, in vec3 rd, vec3 boxSize, out vec3 outNormal ) 
{
    vec3 m = 1.0/rd; // can precompute if traversing a set of aligned boxes
    vec3 n = m*ro;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*boxSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return vec2(-1.0); // no intersection
    outNormal = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
    return vec2( tN, tF );
}

float roundedboxIntersect( in vec3 ro, in vec3 rd, in vec3 size, in float rad )
{
    // bounding box
    vec3 m = 1.0/rd;
    vec3 n = m*ro;
    vec3 k = abs(m)*(size+rad);
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return -1.0;
    float t = tN;

    // convert to first octant
    vec3 pos = ro+t*rd;
    vec3 s = sign(pos);
    ro  *= s;
    rd  *= s;
    pos *= s;
        
    // faces
    pos -= size;
    pos = max( pos.xyz, pos.yzx );
    if( min(min(pos.x,pos.y),pos.z) < 0.0 ) return t;

    // some precomputation
    vec3 oc = ro - size;
    vec3 dd = rd*rd;
    vec3 oo = oc*oc;
    vec3 od = oc*rd;
    float ra2 = rad*rad;

    t = 1e20;        

    // corner
    {
    float b = od.x + od.y + od.z;
    float c = oo.x + oo.y + oo.z - ra2;
    float h = b*b - c;
    if( h>0.0 ) t = -b-sqrt(h);
    }
    // edge X
    {
    float a = dd.y + dd.z;
    float b = od.y + od.z;
    float c = oo.y + oo.z - ra2;
    float h = b*b - a*c;
    if( h>0.0 )
    {
        h = (-b-sqrt(h))/a;
        if( h>0.0 && h<t && abs(ro.x+rd.x*h)<size.x ) t = h;
    }
    }
    // edge Y
    {
    float a = dd.z + dd.x;
    float b = od.z + od.x;
    float c = oo.z + oo.x - ra2;
    float h = b*b - a*c;
    if( h>0.0 )
    {
        h = (-b-sqrt(h))/a;
        if( h>0.0 && h<t && abs(ro.y+rd.y*h)<size.y ) t = h;
    }
    }
    // edge Z
    {
    float a = dd.x + dd.y;
    float b = od.x + od.y;
    float c = oo.x + oo.y - ra2;
    float h = b*b - a*c;
    if( h>0.0 )
    {
        h = (-b-sqrt(h))/a;
        if( h>0.0 && h<t && abs(ro.z+rd.z*h)<size.z ) t = h;
    }
    }

    if( t>1e19 ) t=-1.0;
    
    return t;
}

vec3 roundBoxNorm(in vec3 pos, in vec3 siz, in float rad )
{
    return sign(pos)*normalize(max(abs(pos)-siz,0.0));
}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	vec2 uv01 = uv * 0.5 + 0.5;
	uv.x *= u_resolution.x / u_resolution.y;

	vec3 col = vec3(1);

	// Projection
	//vec3 dir = rayDirection(45.0, u_resolution, gl_FragCoord.xy);
	//vec3 ro = vec3(3.0*cos(u_time), 3, 3.0*sin(u_time));

	//mat4 viewWorld = viewMatrix(ro, vec3(0), vec3(0, 1, 0));
	vec2 uvBack = uv * 8.0;

	uv *= 1.5;
	uv *= rot2D(-45.0 * DEG2R);

	vec2 sgn = sign(mod( floor(uv), 2.0 ) - 0.5);
	//uv.x -= 0.5*u_time*sgn.y;
	//uv = fract(uv) - 0.5;

#if ORTOGRAPHIC

	vec3 ro = vec3(RECT_SIZE*uv, -1.5);
	vec3 rd = vec3(0, 0, 1);

#else

	vec3 ro = vec3(0, 1, -1);
	vec3 rd = normalize(vec3(uv, 1.0));

#endif

	vec2 r45 = vec2(45.0 * DEG2R, 0.0);
	//vec3 rd = (viewWorld * vec4(dir, 0)).xyz;

	ro = rotate(ro, r45.xyy);
	rd = rotate(rd, r45.xyy);

	//ro = rotate(ro, -r45.yxy);
	//rd = rotate(rd, -r45.yxy);

	ro = rotate(ro, r45.yxy * -sin(u_time));
	rd = rotate(rd, r45.yxy * -sin(u_time));

	// Geometry
	
	vec4 box = vec4(vec3(0.3), 0.03);
	
	// Ligt

	float t = roundedboxIntersect(ro, rd, box.xyz, box.w);

	vec3 pos = ro + rd*t;
	vec3 n = roundBoxNorm(pos, box.xyz, box.w);

	//sn = rotate(n, -RT.yxy);

	vec3 lightDir = normalize(vec3(100.0, 200, -100.0) - pos);
	vec3 viewPos = normalize(ro - pos);
	//vec3 reflectDir = normalize(reflect(-lightDir, n));

	//float spec = pow( max( dot(viewPos, reflectDir), 0.0 ), 64.0);

	float rim = 1.0 - dot(viewPos, n);
	vec3 rimLight = vec3(0.5)*rim;

	float diff = max( dot(n, lightDir), 0.0 );

	vec3 ambient = palette(n.x, PAL2)*0.4;
	//vec3 ambient = vec3(0.8902, 0.6078, 0.0039);
	vec3 diffuse = vec3(0.6) * diff;


	//BackGround

	uvBack *= rot2D(length(uvBack) * 0.08 * sin(u_time));
	uvBack = fract(uvBack);

	float grid = max(
		plot(abs(uvBack.x), 0.05),
		plot(abs(uvBack.y), 0.05)
	);

	// Draw

	col = mix(
		palette(uv01.y + 0.075*u_time, PAL2),
		vec3(1),
		grid
	);

	col = mix(
		col,
		clamp(ambient + diffuse + rimLight, 0.0, 1.0),
		step(0.0, t)
	);


	fragColor = vec4(col, 1);

}