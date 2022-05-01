#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265359

#define CMP_PROD(c, z) vec2(c.x*z.x - c.y*z.y, c.y*z.x + c.x*z.y)
#define CMP_MAG(z) length(z)

vec2 Cmp_Cub(vec2 c) {

    vec2 z = c;

    c = CMP_PROD(c, z);
    c = CMP_PROD(c, z);
    //c = CMP_PROD(c, z); 

    return c;

}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 c = 2.0*Cmp_Cub(uv) - 0.1*uv + vec2(0.04, 0);
    vec3 col;

    float r = CMP_MAG(c);
    float theta = atan(c.y, c.x);

    float hue = theta / (2.0*PI);

    col = hsv2rgb(vec3(hue, 1.0, r + 0.75));

    gl_FragColor = vec4(col, 1.0);

}