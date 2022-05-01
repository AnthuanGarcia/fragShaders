#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define GREEN vec3(0.0, 1.0, 0.5333)
#define BLUE  vec3(0.2941, 0.3961, 0.9725)
#define PINK  vec3(0.9216, 0.6157, 0.7922)

const mat2 m = mat2(
    0.5, 0.5,
    0.1, -1.1
);

float hash1( float n ) {
	return fract(sin(n)*75728.5453123); 
}

float noise( in vec2 x ) {

    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0;

    return mix(
        mix(hash1(n + 0.0), hash1(n + 1.0), f.x), 
        mix(hash1(n + 57.0), hash1(n + 58.0), f.x),
    f.y);

}

float fbm( vec2 p ) {

    float value = 0.0;
    float amp   = 0.5;

    for (int i = 0; i < 4; i++) {

        value += amp * noise(p);
        p = p * m;
        amp *= 0.5;

    }

    return value / 0.975;


}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    //uv.x *= u_resolution.x / u_resolution.y;

    float f = fbm(3.0 * uv + u_time);
    float a = fbm(vec2(uv.x, u_time * uv.y));
    float p = fbm(7.0 * uv - u_time);

    vec3 col = vec3(uv, 1);

    col /= mix(col, GREEN, f);
    col *= mix(col, BLUE, a);
    col -= mix(col, PINK, p);

    gl_FragColor = vec4(col, 1.0);

}