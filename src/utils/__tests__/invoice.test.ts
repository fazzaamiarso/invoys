import { calculateOrderAmount, generatePrefix } from '@utils/invoice';

describe('generatePrefix', () => {
  test.concurrent('generate the right prefix given value', () => {
    expect(generatePrefix('Arctic Wolf Neworks, Inc ')).toEqual('AWN');
    expect(generatePrefix('Arctic 1Wolf Neworks, Inc ')).toEqual('AWN');
    expect(generatePrefix('Arctic wolf')).toContain('AW');
    expect(generatePrefix('arctic')).toContain('A');
  });
  test.concurrent('generate the prefix when passed no value', () => {
    expect(generatePrefix('')).toHaveLength(3);
    expect(generatePrefix()).toHaveLength(3);
  });
});

describe('calculateOrderAmount', () => {
  test.concurrent('calculate the right amount', () => {
    expect(
      calculateOrderAmount([
        { amount: 40, quantity: 3 },
        { amount: 40, quantity: 3 },
      ])
    ).toEqual(240);
    expect(
      calculateOrderAmount([
        { amount: 0, quantity: 3 },
        { amount: 40, quantity: 3 },
      ])
    ).toEqual(120);
  });
});
