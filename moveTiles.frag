#ifdef GL_ES
precision mediump float;
#endif

#define TIME_SECS sin(u_time * 6.28)

uniform vec2 u_resolution;
uniform float u_time;

vec2 brickTile(vec2 _st, float _zoom, float _speed){
    float vel = u_time * _speed;
    _st *= _zoom;
       
    if (step(1.0, mod(vel, 2.0)) == 1.0)
        _st = _st.yx;
    
    // Here is where the offset is happening
    _st.x += vel;
    _st.x -= step(1.0, mod(_st.y, 2.0)) * 2.0 * vel;

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
    st = brickTile(st, 5.0, .850);
    color = box(st,vec2(0.9)) * vec3(1);

    // Uncomment to see the space coordinates
    //color = vec3(st,0.0);

    gl_FragColor = vec4(color,1.0);
}
