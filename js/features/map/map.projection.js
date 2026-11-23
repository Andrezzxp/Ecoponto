// Projeção Web Mercator (tiles de 256 px).

const TS = 256;
const wx = (g, z) => ((g + 180) / 360) * TS * 2 ** z;

const wy = (a, z) => {
  const r = (a * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * TS * 2 ** z;
};

const ux = (x, z) => (x / (TS * 2 ** z)) * 360 - 180;
const uy = (y, z) => {
  const n = Math.PI - (2 * Math.PI * y) / (TS * 2 ** z);
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
};
