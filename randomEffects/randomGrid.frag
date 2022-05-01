#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

#define ZOOM vec2(6)
#define RX        1.0 / min(u_resolution.x, u_resolution.y)
#define MOD_INT(a, b) a - b*(a/b)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, abs(p));

}

vec2 noise_2(vec2 p) {

    return fract(
        sin(
            vec2(
                dot(p, vec2(130.7, 541.2) ),
                dot(p, vec2(696.69, 101.4))
            )
        ) * 679812.7684
    );

}

#ifdef BUFFER_0

void main() {

    vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    uv *= ZOOM;

    vec2 axis = uv;
    vec3 col = vec3(0);

    /*mat2 trans = mat2(
        1, 1.0/length(axis) - 1.75,
        1.0/length(axis), 1
    );*/

    //axis.x += uv.y;
    //axis.y = uv.x;

    axis.y += u_time;
    axis = fract(axis);

    col += plot(axis.x, 0.075);
    col += plot(axis.y, 0.075);
    //col += plot(axis2.x, 0.05);
    //col += plot(axis2.y, 0.05);
    //col += plot(axis2.x - 1.0, 0.05);
    //col += plot(axis2.y - 1.0, 0.05);

    gl_FragColor = vec4(col, 1.0);

}

#else

    void main() {

        vec2 uv = gl_FragCoord.xy / u_resolution;

        vec2 mou = u_mouse / u_resolution;

        vec2 fpos = fract(uv);
        vec2 ipos = floor(uv);

        float minDist = 10.0;

        vec2 uv2 = uv;

        for (int y = -1; y <= 1; y++) {

            for (int x = -1; x <= 1; x++) {

                vec2 nei = vec2(float(x), float(y));
                vec2 point = noise_2(ipos + nei);

                point = 0.5*sin(u_time + point*19.0) + 0.5;
                
                vec2 diff = nei + point - fpos;
                float dist = length(diff);

                minDist = min(minDist, dist);
   
            }

        }

        uv.x += uv2.x * (minDist + mou.x);
        uv.y += uv2.x * (minDist + mou.y);

        vec3 tex = texture2D(u_buffer0, fract(uv), 0.0).stp;
        
        //tex -= minDist;
        //tex += 1.0-step(.02, minDist);
        //tex -= 1.0;

        gl_FragColor = vec4(tex, 1);

    }

#endif