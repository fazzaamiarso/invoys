import { PropsWithChildren, ReactNode } from 'react';
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
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  Icon?: HeroIconProps;
  disabled?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  loadingContent?: ReactNode;
}>;

const Button = ({
  type,
  children,
  variant,
  Icon,
  onClick,
  isLoading,
  loadingContent,
}: ButtonProps) => {
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      className={clsx(
        'px-4 py-2 rounded-md font-semibold text-sm',
        Icon ? 'flex items-center gap-2' : '',
        variant ? v[variant] : v.primary
      )}>
      {isLoading && loadingContent}
      {!isLoading && Icon && <Icon className="aspect-square h-4" />}
      {!isLoading && children}
    </button>
  );
};

export default Button;
