import { getErrorMessage } from '@utils/getErrorMessage';

describe('getErrorMessage', () => {
  test('return the message property if error object is Error instance', () => {
    const errorMessage = 'Something went horribly wrong!';
    expect(getErrorMessage(new Error(errorMessage))).eq(errorMessage);
  });
  test('return the stringified message if error is not Error instance', () => {
    const errorObject = { statusCode: 404, message: 'Not Found' };
    expect(getErrorMessage(errorObject)).eq(JSON.stringify(errorObject));
  });
});
