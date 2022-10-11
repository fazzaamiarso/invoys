import { PropsWithChildren } from 'react';
import clsx from 'clsx';
import v from './variant.module.css';

type HeroIconProps = (
  props: React.ComponentProps<'svg'> & {
    title?: string;
    titleId?: string;
  }
) => JSX.Element;

type ButtonProps = PropsWithChildren<{
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  Icon?: HeroIconProps;
}>;

const Button = ({ type, children, variant, Icon }: ButtonProps) => {
  return (
    <button
      type={type ?? 'button'}
      className={clsx(
        'px-4 py-2 rounded-md',
        Icon ? 'flex items-center gap-2' : '',
        variant ? v[variant] : v.primary
      )}>
      {Icon && <Icon className="aspect-square h-4" />}
      {children}
    </button>
  );
};

export default Button;
