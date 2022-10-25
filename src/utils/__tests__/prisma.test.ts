import { faker } from '@faker-js/faker';
import { parseSort } from '@utils/prisma';

describe('parseSort', () => {
  test('parse correctly', () => {
    const city = faker.address.cityName();
    const name = faker.name.firstName();
    const zipCode = faker.address.zipCode();

    expect(parseSort({ city })).toStrictEqual({ city });
    expect(parseSort({ customer_name: name })).toStrictEqual({
      customer: { name },
    });
    expect(parseSort({ state_city_zip: zipCode })).toStrictEqual({
      state: { city: { zip: zipCode } },
    });
  });
  test('parse correctly with empty object passed', () => {
    expect(parseSort({})).toBe(undefined);
  });
});
