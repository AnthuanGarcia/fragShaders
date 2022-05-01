#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

out vec4 fragColor;

#define PI 3.14159265

#define RADIUS 0.01
#define GLOW(r, d, i) pow(r/(d), i)

float noise_1(vec2 st) {

    return fract(
        sin(
            dot(
                st.xy,
                vec2(12.9898,78.233)
            )
        ) * 43758.5453123
    );

}

#ifdef BUFFER_0

    void main() {

        vec2 uv = gl_FragCoord.xy / u_resolution;
        uv -= 0.5;
        uv *= 5.0;
        uv.x *= u_resolution.x / u_resolution.y;

        vec3 col = vec3(0);

        //uv += 0.5*u_time;

        vec2 fpos = fract(uv);
        vec2 fpos2 = fract(-uv);

        col += GLOW(RADIUS, abs(fpos.y) , 1.1) + 
            GLOW(RADIUS, abs(fpos2.y), 1.1) + 
            GLOW(RADIUS, abs(fpos.x) , 1.1) + 
            GLOW(RADIUS, abs(fpos2.x), 1.1);

        col = 1.0 - exp( -col );

        fragColor = vec4(col, 1);

    }

#else

    void main() {

        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 offset;
        
        float t = 0.0065 * sin(2.0*u_time);

        offset.x = t;
        offset.y = -t;

        float rnd = noise_1(offset);
        //float move = pow( smoothstep(0.0, step(-0.1, -rnd), uv.x*0.5), 5.0*sin(u_time)+5.1 );

        vec2 dis = vec2(0, 0.5 * floor( sin(PI*uv.y) + 1.0 ) );

        if (uv.y > 0.2 && uv.y < 0.25)
            uv.x += dis.y;

        vec4 left = texture( u_buffer0, uv );
        vec4 right = texture( u_buffer0, uv + offset*rnd);
        vec3 color = vec3( left.r, right.gb );

        //color *= vec3( 1.0, 1.0, 1.0 );
        //color = clamp( color, 0.0, 1.0 );

        fragColor = vec4( color, 1. );

    }

#endif