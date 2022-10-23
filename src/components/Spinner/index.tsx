import clsx from 'clsx';
import s from './spinner.module.css';

const Spinner = () => {
  return <div className={clsx(s.loader, 'border-pink-500')} />;
};

export default Spinner;
