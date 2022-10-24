import clsx from 'clsx';
import s from './spinner.module.css';

const Spinner = () => {
  return <span className={(clsx(s.loader), 'w-12 aspect-square')} />;
};

export default Spinner;
