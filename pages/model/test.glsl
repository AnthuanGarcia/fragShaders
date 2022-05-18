#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_normalMatrix;

in vec4 a_position;
in vec4 a_normal;
in vec2 a_texcoord;
in vec4 a_color;

#ifdef VERTEX

    out vec4 pos;

    void main() {

        pos = u_modelViewMatrix * u_projectionMatrix * a_position;

    }

#else

    out vec4 fragColor;

    void main() {

        fragColor = vec4(a_normal, 1.0);

    }

#endif