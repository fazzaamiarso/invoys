import { useEffect, useRef } from 'react';

const usePrevious = <T,>(value: T) => {
  const savedValue = useRef(value);

  useEffect(() => {
    savedValue.current = value;
  }, [value]);

  return savedValue.current;
};

export default usePrevious;
