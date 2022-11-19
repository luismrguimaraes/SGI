#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float red;
uniform float green;
uniform float blue;

void main() {

	vec4 color = texture2D(uSampler, vTextureCoord);

	vec4 finalColor = color;
	finalColor.r = color.r * red + color.g * green + color.b * blue;
	finalColor.g = color.r * red + color.g * green + color.b * blue;
	finalColor.b = color.r * red + color.g * green + color.b * blue;

	gl_FragColor = finalColor;
	
}