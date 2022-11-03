import { twGradients } from 'data/gradients';

export const parseSort = (sortObject: Record<string, any>) => {
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

export const getRandomGradient = () => {
  const gradientKeys = Object.keys(twGradients);
  const idx = Math.floor(Math.random() * gradientKeys.length);
  const randomGradient = gradientKeys.at(idx);
  return randomGradient;
};
