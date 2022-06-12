#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define TWO_PI 6.283185
#define range(ii, l, s) for(float i = ii; i < l; i += s)

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {

    return a + b*cos( TWO_PI*(c*t + d) );

}

float noise(vec2 st) {

    return fract(
        sin(
            dot(
                st.xy,
                vec2(12.9898,78.233)
            )
        ) * 43758.5453123
    );

}

vec3 hsv2rgb_smooth( in vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

	rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing	

	return c.z * mix( vec3(1.0), rgb, c.y);
}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
    uv.x *= u_resolution.x / u_resolution.y;
    uv *= 2.0;

    //uv.x += u_time*0.1;

    vec3 col;

    range(1.0, 16.0, 1.0) {

        uv.x -= 0.4/i * sin(3.0*cos(i*uv.y + u_time*0.5));
        uv.y -= 0.4/i * cos(5.0*sin(i*uv.x + u_time*0.5));

    }

    uv *= mat2(
        1, tan(sin(u_time)),
        0, 1
    );

    vec3 col2 = hsv2rgb_smooth(uv.xyx);

    col.r = sin(col2.g + col2.b) * 1.5 + 0.1;
    col.g = cos(col2.r + col2.b) * 0.5 + 1.1;
    col.b = (sin(col2.g + col2.r) + cos(col2.r + col2.g)) * 0.5 + 1.1;

    //col.r = sin(uv.x + uv.y);
    //col.g -= (sin(uv.x + uv.y) - cos(uv.x + uv.y)) * 0.5;
    //col.b = cos(uv.x + uv.y) * 10.5 + 0.5;

    fragColor = vec4(col, 1);

}