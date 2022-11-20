#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float redFactor;
uniform float greenFactor;
uniform float blueFactor;
uniform float timeFactor;
uniform float compTimeFactor;

void main() {

	vec4 texture = texture2D(uSampler, vTextureCoord);
	vec4 color = vec4(redFactor, greenFactor, blueFactor, 1.0);

	vec4 finalColor=texture*compTimeFactor+color*timeFactor;

	gl_FragColor=finalColor;
}