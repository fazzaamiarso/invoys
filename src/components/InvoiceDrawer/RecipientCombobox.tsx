import { Combobox } from '@headlessui/react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import { Customer } from '@prisma/client';
import { trpc } from '@utils/trpc';
import clsx from 'clsx';
import useDebounce from '@hooks/useDebounce';
import { useState } from 'react';

type ComboboxProps = {
  selectedClient?: string;
  onSelectClient: (value: string) => void;
};
export const RecipientCombobox = ({
  selectedClient,
  onSelectClient,
}: ComboboxProps) => {
  const utils = trpc.useContext();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const { data: searchedClients } = trpc.customer.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: Boolean(debouncedQuery),
      keepPreviousData: true,
    }
  );

  const { data: initialClients } = trpc.customer.getAll.useQuery(
    { limit: 10 },
    {
      staleTime: Infinity,
      keepPreviousData: true,
      initialData: () => {
        const data = utils.customer.infiniteClients.getData({
          limit: 10,
          query: '',
        });
        return data?.customer.length ? data.customer : undefined;
      },
      onSuccess(data) {
        data[0] && onSelectClient(data[0].email);
      },
    }
  );

  const selectedRecipient =
    selectedClient ?? (initialClients && initialClients[0]?.email) ?? '';

  return (
    <div>
      <Combobox
        as="div"
        className="relative"
        value={selectedRecipient}
        onChange={onSelectClient}>
        <div className="rounded-md bg-blue-50 ring-1 ring-blue-200 space-y-4 p-4">
          <div className="relative w-full">
            <div className="relative flex flex-col gap-2">
              <label
                htmlFor="rec-email"
                className="text-gray-600 font-semibold">
                Recipient Email
              </label>
              <Combobox.Input
                type="text"
                id="rec-email"
                autoComplete="off"
                onChange={event => setQuery(event.target.value)}
                displayValue={() => selectedRecipient}
                className="rounded-sm text-sm border-gray-300 text-gray-700"
              />
              <Combobox.Button className="absolute inset-y-0 right-0 top-8 flex items-center px-3">
                <ChevronDownIcon
                  className="h-5 aspect-square text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute z-20 w-full rounded-md left-0 py-1 -bottom-1 translate-y-[100%] bg-white shadow-md">
              {debouncedQuery === '' &&
                initialClients?.map(c => <EmailOption key={c.id} client={c} />)}
              {debouncedQuery &&
                searchedClients?.map(c => (
                  <EmailOption key={c.id} client={c} />
                ))}
              {searchedClients?.length === 0 && debouncedQuery && (
                <div className="text-sm p-2">No Clients Found</div>
              )}
            </Combobox.Options>
          </div>
        </div>
      </Combobox>
    </div>
  );
};

type OptionProps = {
  client: Customer;
};
const EmailOption = ({ client }: OptionProps) => {
  return (
    <Combobox.Option
      key={client.id}
      value={client.email}
      className="w-full text-sm">
      {({ active, selected }) => {
        return (
          <div className={clsx('w-full py-2', active && 'bg-pink-100')}>
            <div className="flex items-center px-2">
              {!selected && (
                <div className="h-4 pr-2 bg-transparent aspect-square" />
              )}
              {selected && <CheckIcon className="h-4 pr-2" />} {client.email} (
              {client.name})
            </div>
          </div>
        );
      }}
    </Combobox.Option>
  );
};
