import plainDayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

plainDayjs.extend(localizedFormat);
export const dayjs = plainDayjs;
