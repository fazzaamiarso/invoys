import clsx from 'clsx';
import { HTMLProps, useRef, useEffect } from 'react';

const IndeterminateCheckbox = ({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof indeterminate === 'boolean' && ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={clsx(className, 'cursor-pointer')}
      {...rest}
    />
  );
};

export default IndeterminateCheckbox;
