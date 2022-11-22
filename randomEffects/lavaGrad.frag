#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define PI     3.14159265
#define TWO_PI 6.283185

#define PAL12 vec3(0.300, 0.500, 0.357), vec3(0.698, 0.468, 0.299), vec3(0.768, 1.257, 1.503), vec3(2.824, 3.537, 3.216)
#define PAL2 vec3(0.888,0.218,1.108),\
        vec3(0.968,-0.472,0.63),\
        vec3(1.218,0.888,0.00),\
        vec3(-1.582,1.808,1.478)

#define PAL5 vec3(0.519, 0.756, 0.712), vec3(0.840, 0.834, 0.469), vec3(0.302, 1.019, 0.804), vec3(3.159, 4.132, 5.220)
#define PAL6 vec3(0.530, 0.787, 0.485), vec3(0.420, 0.089, 0.758), vec3(0.133, 0.924, 0.008), vec3(4.820, 4.553, 2.869)
#define PAL11 vec3(0.910, 0.960, 0.897), vec3(0.814, 0.588, 0.735), vec3(0.888, -0.552, 1.110), vec3(4.227, 3.567, 5.852)

mat2 rot2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, -s,
        s, c
    );

}

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

float smoothNoise(vec2 st) {

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    fpos = fpos*fpos * (3.0 - 2.0 * fpos);

    float bl = noise(ipos);
    float br = noise(ipos + vec2(1, 0));
    float b  = mix(bl, br, fpos.x);
    
    float tl = noise(ipos + vec2(0, 1));
    float tr = noise(ipos + vec2(1));
    float t  = mix(tl, tr, fpos.x);

    return mix(b, t, fpos.y);

}

#define OCTAVES 2

float fbm(in vec2 st) {

    float value = 0.0;
    float amp   = 0.5;
    vec2 shift  = vec2(10);

    for (int i = 1; i <= OCTAVES; i++) {

        value += amp * smoothNoise(st + 0.5*u_time);
        st = st * 2.0 + shift;

		st *= rot2D(PI / float(i));
        amp *= 0.5;

    }

    return value;

}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( TWO_PI*(c*t + d) );

}

vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
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

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= u_resolution.x / u_resolution.y;

	uv *= 1.5;

	//float h = simplex3D(vec3(uv, u_time));
	float h = fbm(uv);
	vec3 col = palette(h + 3.6, PAL11);

	//vec3 col = smoothstep(
	//	vec3(0.6353, 1.0, 0.0),
	//	vec3(0.5, 0, 1.0),
	//	vec3(h)
	//);

	//vec3 col = mix(
	//	vec3(1, 0.5, 0),
	//	vec3(0, 0, 1),
	//	h
	//);

	fragColor = vec4(col, 1);

}