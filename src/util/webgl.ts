import fragment from "../renderers/pixiRenderer/shaders/world.frag?raw";
import vertex from "../renderers/pixiRenderer/shaders/world.vert?raw";

const testIsWebGL2Supported = () => {
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) {
    return false;
  }

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertexShader, vertex);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    return false;
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragmentShader, fragment);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    return false;
  }

  const shaderProgram = gl.createProgram()!;
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    return false;
  }

  return true;
};

export const isWebGL2Supported = testIsWebGL2Supported();
