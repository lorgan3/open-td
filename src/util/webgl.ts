export const isWebGL2Supported = () =>
  !!document.createElement("canvas").getContext("webgl2");
