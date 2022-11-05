import { useEffect, useState } from 'react';

/**
 * Debounce a state value
 */
const useDebounce = <T,>(val: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(val);

  useEffect(() => {
    const timerHandler = setTimeout(() => {
      setDebouncedValue(val);
    }, delay);
    return () => clearTimeout(timerHandler);
  }, [val, delay]);

  return debouncedValue;
};

export default useDebounce;
