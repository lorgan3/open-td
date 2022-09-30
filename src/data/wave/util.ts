export const splitNumber = (val: number, parts: number) => {
  const weights = new Array(parts).fill(0).map(Math.random);
  const sum = weights.reduce((sum, weight) => sum + weight);

  return weights.map((weight) => (weight / sum) * val);
};

export const normalDistributionRandom = (): number => {
  let u = 1 - Math.random();
  let v = Math.random();
  let rand = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  rand = rand / 10.0 + 0.5; // Translate to 0 -> 1
  if (rand > 1 || rand < 0) return normalDistributionRandom(); // resample between 0 and 1
  return rand;
};
