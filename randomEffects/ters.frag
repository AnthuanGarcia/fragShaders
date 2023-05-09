#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define BORDER 0
#define BLACK  01

#define SIN0(x) ((sin(x) + 1.0) * 0.5)
#define RX 1.0 / min(u_resolution.x, u_resolution.y)

#define TWO_PI 6.283185

#define PAL6 vec3(0.530, 0.787, 0.485), vec3(0.420, 0.089, 0.758), vec3(0.133, 0.924, 0.008), vec3(4.820, 4.553, 2.869)
#define PAL10 vec3(0.500, 0.830, 0.168), vec3(-0.500, 0.400, 0.968), vec3(-0.500, 0.150, 0.000), vec3(2.000, -1.767, 0.177)
#define PAL11 vec3(0.910, 0.960, 0.897), vec3(0.814, 0.588, 0.735), vec3(0.888, -0.552, 1.110), vec3(4.227, 3.567, 5.852)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( TWO_PI*(c*t + d) );

}

mat2 rotate2D(float angle) {

	float s = sin(angle), c = cos(angle);
	return mat2(c, -s, s, c);

}

void main() {

	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy)/u_resolution.y;
    vec3 col = vec3(0);
    float t = u_time;

	vec2 aspect = u_resolution / u_resolution.yx;
	//uv *= aspect.x;
    
    vec2 n = vec2(0),q;
    vec2 N = vec2(0);
    vec2 p = uv + t*0.1;
    float S = 10.;
    mat2 m = rotate2D(1.0);

    for (float j = 0.0; j < 12.; j++){
    	p *= m;
    	n *= m;
    	q = p*S+j+n+t;
    	n += sin(q);
    	N += cos(q)/S;
    	S *= 1.1;
    }

	float o = 1.3;

#if BLACK 
	vec3 f = vec3(N, 0.6);
#else

	vec3 f = mix(
		vec3(N,  1.3),
		palette(N.y + 4.3, PAL11),
		//vec3(1.0, N),
		SIN0(dot(N, N))
	);

	//f = vec3(N, 0.6);

	o = 0.8;

#endif

    col = f*(N.x + N.y + o)+0.01/length(N);

#if BORDER

	//uv *= 2.0;

	col = mix(
		col,
		vec3(1.0, 1.0, 1.0),
		max(
			plot(abs(abs(uv.x) + 0.05 - aspect.x*0.5), 0.001),
			plot(abs(abs(uv.y) - 0.45 ), 0.001)
		)
	);

#endif

	fragColor = vec4(col, 1);

}