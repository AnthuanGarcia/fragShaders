#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

float aastep(float threshold,float value){
    float afwidth=length(vec2(dFdx(value),dFdy(value)))*.70710678118654757;
    return smoothstep(threshold-afwidth,threshold+afwidth,value);
}

void main(){
    
    vec2 uv=2.*(gl_FragCoord.xy/u_resolution)-1.;
    uv.x*=u_resolution.x/u_resolution.y;
    
    uv*=5.;
    
    vec2 center=vec2(0);
    float radius=3.;
    
    float circle=length(uv-center)-radius;
    vec4 col=vec4(1.0, 1.0, 1.0, 1.0);
    
    col = mix(
        vec4(1),
        vec4(0.9608, 0.6549, 0.8706, 1.0),
        1.0 - circle
    );

    center=vec2(cos(u_time), sin(u_time)) *4.5;
    center -= cos(u_time);
    radius=3.;
    
    circle=length(uv-center)-radius;
    
    vec4 col2 = mix(
        vec4(1.0, 1.0, 1.0, 1.0),
        vec4(0.8078, 0.9412, 0.4392, 1.0),
        1.0 - circle
    );

    col = (col + col2) * 0.5;
    //col += circle*vec4(0.9608, 0.7608, 0.9804, 0.846);

    fragColor = col;
    
}