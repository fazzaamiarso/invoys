const getRandomIndexValue = (value: string) => {
  return value.charAt(Math.floor(Math.random() * value.length));
};

const ALPHABET = 'ABCDHIJKLMNOPQRSTUVWXYZ';

/**
 * Get 3 letter Invoice Number prefix
 */
export const generatePrefix = (value?: string) => {
  let [first, second, third] = value
    ? value.toUpperCase().split(/[A-Z]/gi, 3)
    : [];

  third = third ? third.charAt(0) : getRandomIndexValue(ALPHABET);
  second = second ? second.charAt(0) : getRandomIndexValue(ALPHABET);
  first = first ? first.charAt(0) : getRandomIndexValue(ALPHABET);

  return `${first}${second}${third}`;
};
