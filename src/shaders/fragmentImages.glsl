uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uTime;
varying vec2 vUvs;

void main() {
   const float speed = 1.0;
    const float distortionAmount = 0.05;
    const float distortionIntensity = 4.0;
    	
	vec2 relativeMouse = uMouse.xy / uResolution.xy;
  	vec2 dv = vec2(relativeMouse.x - vUvs.x, relativeMouse.y - vUvs.y);	
  float slope = cos(length(dv) * distortionIntensity - uTime * speed);
  vec4 color = texture2D(uTexture, vUvs + normalize(vUvs) * slope * distortionAmount);
  gl_FragColor = color;
}