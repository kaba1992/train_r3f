uniform sampler2D uTexture;
varying vec2 vUvs;

void main() {
  vec4 color = texture2D(uTexture, vUvs);
  gl_FragColor = color;
}