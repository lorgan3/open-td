export const mod = (value: number, modulo: number) =>
  ((value % modulo) + modulo) % modulo;

export const lerp = (start: number, end: number, t: number) => {
  return start + (end - start) * t;
};

export const clamp = (current: number, desired: number, speed: number) => {
  if (current === desired) {
    return desired;
  }

  if (current > desired) {
    return Math.max(desired, current - speed);
  }

  return Math.min(desired, current + speed);
};

export const clampDegrees = (
  current: number,
  desired: number,
  speed: number
) => {
  if (current === desired) {
    return desired;
  }

  const diff = mod(desired - current + 180, 360) - 180;

  if (diff < 0) {
    return (current - Math.min(-diff, speed) + 360) % 360;
  }

  return current + Math.min(diff, speed);
};
