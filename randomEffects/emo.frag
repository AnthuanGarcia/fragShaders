#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;
uniform sampler2D u_buffer1;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y
#define RX 1.0 / min(u_resolution.x, u_resolution.y)

#define V2TIME vec2(u_time)
#define GRID   80.0

#define CIRCLE(p, r) length(p) - abs(r)
#define SDF_SQR(p, l, r) length( max( abs(p) - l, 0.0 ) ) - r
#define SQR(p, l) max(p.x, p.y) - l

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

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

#if defined(BUFFER_0)

	void main() {

		vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);;

		uv.x -= 0.25;
		uv = -uv.yx;

		float change = step(0.6, smoothNoise(V2TIME));
		//float change = 1.0;

		vec3 col = vec3(change);
		vec2 eyeL = uv + vec2(0.5,  -0.6);
		vec2 eyeR = uv - vec2(0.5,  0.6);

		vec2 mouth = uv*50.0*sign(change - 0.5);

		mouth.y += 1.0;
		//mouth.y -= floor(0.0075*mouth.x*mouth.x);
		mouth.y -= 0.0075*mouth.x*mouth.x;

		col += (plot(CIRCLE(eyeL, 0.075), 0.0) + 
		plot(CIRCLE(eyeR, 0.075), 0.0) +
		plot(abs(mouth.y), 1.5) * step(abs(mouth.x), 40.0))*sign(-change + 0.5);

		fragColor = vec4(col, 1);

	}

#elif defined(BUFFER_1)

	void main() {

		vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;

		vec2 num = vec2(
			GRID * (ASPECT),
			GRID
		);

		vec2 uvDot = ( ( (floor(uv * num) + 0.5) / num ) + 1.0 ) * 0.5;
		vec3 st = texture(u_buffer0, uvDot).rgb;

		vec2 uvGrid = fract(uv * num) - 0.5;

		vec3 col = (st + 0.05) * 6.0 * SDF_SQR(uvGrid, 0.05, 0.0);
		//vec3 col = st;
		//vec3 col = texture(u_buffer0, uv).rgb;

		fragColor = vec4(col, 1);

	}

#else

	void main() {

		vec2 uv = gl_FragCoord.xy / u_resolution;		

		float t = 0.005 * noise(V2TIME);
   		vec2 offset = vec2(-t, t);

		vec3 left = texture(u_buffer1, uv).rgb;
		vec3 right = texture(u_buffer1, uv - offset).rgb;

		vec3 col = vec3(left.r, right.gb);

		col = texture(u_buffer1, uv).rgb;

		/*vec2 v = (uv - 0.5) * 1.5;
		v *= v;

		col *= pow(1.0 - dot(v, v), 2.5);*/

		fragColor = vec4(col, 1.0);

	}

#endif