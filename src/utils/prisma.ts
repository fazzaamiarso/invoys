import { twGradients } from 'data/gradients';

/**
 * Parse a record to prisma's sort input format
 */
export const parseSort = (sortObject: Record<string, unknown>) => {
  for (const key in sortObject) {
    if (!key) continue;
    const splitted = key.split('_');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const init = { [splitted.pop()!]: sortObject[key] };
    return splitted.length > 0
      ? splitted.reduceRight((acc, k) => ({ [k]: acc }), init)
      : init;
  }
};

/**
 * Get a random gradient in tailwind class format
 */
export const getRandomGradient = () => {
  const gradientKeys = Object.keys(twGradients);
  const idx = Math.floor(Math.random() * gradientKeys.length);
  const randomGradient = gradientKeys.at(idx);
  return randomGradient;
};
