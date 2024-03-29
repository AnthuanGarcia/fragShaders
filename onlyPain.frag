// Author @patriciogv ( patriciogonzalezvivo.com ) - 2015

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265
#define SPEED u_time * 1.25

vec2 brickTile(vec2 _st, float _zoom) {

    _st *= _zoom;

    //float evenx = mod(_st.y, 2.0);
    //float eveny = mod(_st.x, 2.0);
//
    //float movex = sign(evenx - 1.0) * SPEED;
    //float movey = sign(eveny - 1.0) * SPEED;

    vec2 even = mod(_st, 2.0);
    vec2 move = sign(even - 1.0) * SPEED;

    _st.y += move.x * step(1.0,   mod(SPEED, 2.0));
    _st.x += move.y * step(-1.0, -mod(SPEED, 2.0));

    return fract(_st);

}

float box(vec2 _st, vec2 _size){
    _size = vec2(0.5)-_size*0.5;
    vec2 uv = smoothstep(_size,_size+vec2(1e-4),_st);
    uv *= smoothstep(_size,_size+vec2(1e-4),vec2(1.0)-_st);
    return uv.x*uv.y;
}

void main(void){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 color = vec3(0.0);

    // Modern metric brick of 215mm x 102.5mm x 65mm
    // http://www.jaharrison.me.uk/Brickwork/Sizes.html
    //st /= vec2(2.15,0.65)/1.5;

    // Apply the brick tiling
    st = brickTile(st, 10.0);

    color = vec3(box(st,vec2(0.9)));

    // Uncomment to see the space coordinates
    //color = vec3(st,0.0);

    gl_FragColor = vec4(color,1.0);
}
