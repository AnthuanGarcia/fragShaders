#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define PIXELATE 0

#define SIN0_1(x) (0.5 * sin(x) + 0.5)

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

float randomRange (in vec2 seed, in float min, in float max) {
	return min + noise(seed) * (max - min);
}

vec2 cpow( vec2 z, float n ) { float r = length( z ); float a = atan( z.y, z.x ); return pow( r, n )*vec2( cos(a*n), sin(a*n) ); }

vec3 IterateMandelbrot( in vec2 c, in vec2 id)
{
    const float B = 64.0;

    float n = 0.0;
    //vec2 z  = vec2(cos(0.15*u_time), sin(0.15*u_time));
	vec2 z = vec2(0);

	vec3 col;

#if PIXELATE
	float k = randomRange(id, 1.0, 50.0) * SIN0_1(0.5*u_time) + 2.0;
#else
	float k = 6.0 * SIN0_1(0.5*u_time) + 2.0;
#endif

    for( int i=0; i < 32; i++ )
    {
        z = cpow(z, k) + c; // z = z² + c
        if( dot(z,z)>(B*B) ) break;
        n += 1.0;
    }

	if( n<99.5 )
    {
        float sit = n - log2(log2(dot(z,z))/(log2(B)))/log2(k); // https://iquilezles.org/articles/msetsmooth
        col = 0.5 + 0.5*cos( 3.0 + sit*0.075*k + vec3(k,0.6,1.0 - k));
    }

    //float sn = n - log(log(length(z))/log(B))/log(2.0); // smooth iteration count
    //float sn = n - log2(log2(dot(z,z))) + 4.0;  // equivalent optimized smooth iteration count
    
    return col;
}

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
	uv.x *= u_resolution.x / u_resolution.y;

	uv *= 3.0;

	//vec2 fpos = fract(uv);
	//vec2 ffpos = fract(fpos * 3.0);
	
	vec2 ipos = floor(uv * 25.0);

	vec3 col = IterateMandelbrot(uv, ipos);

	fragColor = vec4(col, 1);

}