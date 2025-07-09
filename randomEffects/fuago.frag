#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define BORDER 0
#define BLACK 0

#define SIN0(x)((sin(x)+1.)*.5)
#define RX 1./min(u_resolution.x,u_resolution.y)

#define TWO_PI 6.283185

#define PAL6 vec3(.530,.787,.485),vec3(.420,.089,.758),vec3(.133,.924,.008),vec3(4.820,4.553,2.869)
#define PAL10 vec3(.500,.830,.168),vec3(-.500,.400,.968),vec3(-.500,.150,0.),vec3(2.,-1.767,.177)
#define PAL11 vec3(.910,.960,.897),vec3(.814,.588,.735),vec3(.888,-.552,1.110),vec3(4.227,3.567,5.852)
#define PAL20 vec3(.275,.584,.823),vec3(.869,.354,.288),vec3(.479,.461,.015),vec3(4.714,3.884,5.150)
#define PAL24 vec3(1.158,.408,.758),vec3(.138,.538,.233),vec3(1.135,-.352,.898),vec3(3.787,2.368,3.195)

float plot(float p,float t){
	
	return 1.-smoothstep(t-RX*1.5,t+RX*1.5,p);
	
}

vec3 palette(in float t,in vec3 a,in vec3 b,in vec3 c,in vec3 d){
	
	return a+b*cos(TWO_PI*(c*t+d));
	
}

mat2 rotate2D(float angle){
	
	float s=sin(angle),c=cos(angle);
	return mat2(c,-s,s,c);
	
}

void main(){
	
	vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
	vec3 col=vec3(0);
	float t=u_time;
	
	vec2 aspect=u_resolution/u_resolution.yx;
	//uv *= aspect.x;
	
	vec2 n=vec2(0),q;
	vec2 N=vec2(0);
	vec2 p=uv+t*.1;
	float S=10.;
	mat2 m=rotate2D(1.);
	
	for(float j=0.;j<8.;j++){
		for(float i=1.;i<=4.;i++){
			p*=m;
			n*=m;
			q=p*S+j+n+t;
			q*=cos(i);
			n+=sin(q);
			N+=cos(q)/S;
			S*=1.2;
		}
	}
	
	float o=-10.87;
	
	#if BLACK
	vec3 f=vec3(N.y*.1);
	#else
	
	vec3 f=mix(
		vec3(N,1.3),
		palette(N.y+u_time*.3,PAL11),
		//vec3(1.0, N),
		SIN0(dot(N,N))
	);
	
	//f = vec3(N, 0.6);
	
	o=.8;
	
	#endif
	
	col=f*(N.x+N.y+o)+.01/length(N);
	
	#if BORDER
	
	//uv *= 2.0;
	
	col=mix(
		col,
		vec3(1.,1.,1.),
		max(
			plot(abs(abs(uv.x)+.05-aspect.x*.5),.001),
			plot(abs(abs(uv.y)-.45),.001)
		)
	);
	
	#endif
	
	fragColor=vec4(col,1);
	
}