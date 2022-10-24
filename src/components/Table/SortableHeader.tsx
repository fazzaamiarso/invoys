import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { HeaderContext } from '@tanstack/table-core';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';

const SortableHeader = ({
  headerProps,
  children,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
PropsWithChildren<{ headerProps: HeaderContext<any, any> }>) => {
  return (
    <span className="flex items-center">
      <span className="">{children}</span>
      <button
        className=""
        onClick={headerProps.column.getToggleSortingHandler()}>
        <ChevronUpDownIcon
          className={clsx(
            'w-4 aspect-square ml-1',
            headerProps.column.getIsSorted() && 'text-purple-500'
          )}
        />
      </button>
    </span>
  );
};

export default SortableHeader;
