#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define RECURSION_LIMIT 10000
#define PI 3.141592653589793238

// Method for the mathematical construction of the julia set
int juliaSet (vec2 c, vec2 constant) {

  int count;

  vec2 z = c;

  for (int recursionCount = 0; recursionCount < RECURSION_LIMIT; recursionCount++) {
    z = vec2 (z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + constant;

    if (length (z) > 2.0) {
        count = recursionCount;
      break;
    }
  }

  return count;
}

// Main method of the sahder
void main () {
  vec2 constants[6];

    constants[0] = vec2(-0.7176, -0.3842);
    constants[1] = vec2(-0.4, -0.59); // <-- !!!!!!
    constants[2] = vec2(0.34, -0.05); // <-- !!!!!!
    constants[3] = vec2(0.355, 0.355); // <-- !!!!!!
    constants[4] = vec2(-0.54, 0.54);
    constants[5] = vec2(0.355534, -0.337292);

  vec2 uv = 2.0 * (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y; // Normalized pixel coordinates (from 0 to 1)
  vec2 uv2 = uv; // Creates a copy of the uvs for coloring
  vec3 col = vec3 (1.0); // Color to be drawn on the screen

  float a = PI / 3.0; // rotation angle [rad]
  vec2 U = vec2 (cos (a), sin (a)); // U basis vector (new x axis)
  vec2 V = vec2 (-U.y, U.x); // V basis vector (new y axis)
  uv = vec2 (dot (uv, U), dot (uv, V)); // Rotationg the uv
  uv *= 0.9;

  vec2 c = uv;
  int recursionCount = juliaSet (c, constants[4]);
  float f = float(recursionCount) / float(RECURSION_LIMIT);

  float offset = 0.5;
  vec3 saturation = vec3 (1.0, 1.0, 1.0);
  float totalSaturation = 1.0;
  float ff = pow (f, 1.0 - (f * 0.50));
  col.r = smoothstep (0.0, 1.0, ff) * (uv2.x * 0.5 + 0.3);
  col.b = smoothstep (0.0, 1.0, ff) * (uv2.y * 0.5 + 0.3);
  col.g = smoothstep (0.0, 1.0, ff) * (-uv2.x * 0.5 + 0.3);
  col.rgb *= 5000.0 * saturation * totalSaturation;

  gl_FragColor = vec4 (col.rgb, 1.0); // Outputs the result color to the screen
}