// Exact international foot and avoirdupois pound (1959 international yard and pound definitions). Used only to convert
// published U.S.-customary figures; it does not estimate any dimension or mass.
export const METERS_PER_FOOT = 0.3048;
export const KILOGRAMS_PER_POUND = 0.45359237;

function finite(value: number) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('Published quantities must be finite and nonnegative');
}
export function feetToMeters(feet: number): number { finite(feet); return feet * METERS_PER_FOOT; }
export function poundsToKilograms(pounds: number): number { finite(pounds); return pounds * KILOGRAMS_PER_POUND; }
