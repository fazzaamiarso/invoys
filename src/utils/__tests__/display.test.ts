import { capitalize } from '@utils/display';

test('can capitalize correctly', () => {
  expect(capitalize('please capitalize me')).equal('Please capitalize me');
  expect(capitalize('!i am random')).equal('!i am random');
});
