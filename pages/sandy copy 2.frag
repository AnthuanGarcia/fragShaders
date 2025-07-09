#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x/u_resolution.y
#define PI 3.14159265
#define D2R.0174532925

float noise(vec2 st){
    
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
    
}

float smoothnoise(vec2 st){
    
    vec2 ipos=floor(st);
    vec2 fpos=fract(st);
    
    fpos=fpos*fpos*(3.-2.*fpos);
    
    float bl=noise(ipos);
    float br=noise(ipos+vec2(1,0));
    float b=mix(bl,br,fpos.x);
    
    float tl=noise(ipos+vec2(0,1));
    float tr=noise(ipos+vec2(1));
    float t=mix(tl,tr,fpos.x);
    
    return mix(b,t,fpos.y);
    
}

float randomRange(in vec2 seed,in float min,in float max){
    return min+smoothnoise(seed)*(max-min);
}

mat2 rot2D(float angle){
    float c=cos(angle),s=sin(angle);
    return mat2(c,s,-s,c);
}

float circle(vec2 p,float r){
    return length(p)-r;
}

float square(vec2 p,float l){
    p=abs(p);
    return max(p.x,p.y)-l;
}

void main(){
    
    vec2 uv=2.0*(gl_FragCoord.xy/u_resolution)-1.0;
    uv.x*=ASPECT;
    
    vec3 col=vec3(0.9333, 0.0549, 0.5373);
    vec3 cirCol=vec3(1.0, 0.5608, 0.2039);

    col = mix(col, cirCol, uv.y * 0.5 + 1.0);
    col += smoothnoise(uv * 500.0) * 0.1;

    fragColor=vec4(col,1);
    
}
