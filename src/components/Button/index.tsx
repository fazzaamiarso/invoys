import React, { forwardRef, PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';
import v from './variant.module.css';
import Link, { LinkProps } from 'next/link';
import { LoadingSpinner } from '@components/Spinner';

type HeroIconProps = (
  props: React.ComponentProps<'svg'> & {
    title?: string;
    titleId?: string;
  }
) => JSX.Element;

type CommonProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  Icon?: HeroIconProps;
  disabled?: boolean;
  onClick?: () => void;
};

type ButtonProps = CommonProps & {
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  loadingContent?: ReactNode;
};

type AnchorProps = CommonProps &
  LinkProps &
  Omit<React.HTMLProps<HTMLAnchorElement>, keyof LinkProps>;

type RefEl = HTMLButtonElement;

const Button = forwardRef<RefEl, PropsWithChildren<ButtonProps | AnchorProps>>(
  (props, ref) => {
    if ('href' in props)
      return (
        <Link
          {...props}
          ref={null}
          href={props.href}
          onClick={props.onClick}
          className={clsx(
            'px-4 py-2 rounded-md font-semibold text-sm',
            props.Icon ? 'flex items-center gap-2' : '',
            props.variant ? v[props.variant] : v.primary,
            props.className
          )}>
          <>
            {props.Icon && <props.Icon className="aspect-square h-4" />}
            {props.children}
          </>
        </Link>
      );

    const {
      type,
      children,
      variant,
      Icon,
      onClick,
      isLoading,
      loadingContent,
      disabled,
    } = props;

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        onClick={onClick}
        disabled={disabled}
        className={clsx(
          'px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2',
          variant ? v[variant] : v.primary
        )}>
        {isLoading && <LoadingSpinner twWidth="w-4" />}
        {isLoading && loadingContent}
        {!isLoading && Icon && <Icon className="aspect-square h-4" />}
        {!isLoading && children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
