#version 300 es

precision mediump float;
		
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
		
out vec4 fragColor;

#define RT rot2D(u_time)

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

float sdUnevenCapsule( vec2 p, float r1, float r2, float h )
{
    p.x = abs(p.x);
    float b = (r1-r2)/h;
    float a = sqrt(1.0-b*b);
    float k = dot(p,vec2(-b,a));
    if( k < 0.0 ) return length(p) - r1;
    if( k > a*h ) return length(p-vec2(0.0,h)) - r2;
    return dot(p, vec2(a,b) ) - r1;
}

void main() {
		
	vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
	//uv *= 3.0;

	vec3 col;


	col += step(-0.00005, -dot(uv, uv));

	fragColor = vec4(col, 1);
		
}