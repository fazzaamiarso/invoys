import { capitalize } from '@utils/display';

test('can capitalize correctly', () => {
  expect(capitalize('please capitalize me')).toEqual('Please capitalize me');
  expect(capitalize('!i am random')).toEqual('!i am random');
});
