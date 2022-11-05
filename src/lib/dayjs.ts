import plainDayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

plainDayjs.extend(localizedFormat);
/**
 * Dayjs instance that is already extended with plugins
 */
export const dayjs = plainDayjs;
