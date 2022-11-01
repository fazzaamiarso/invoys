import type { NextPage } from 'next';
import Layout from '@components/Layout';
import { SubmitHandler, useForm } from 'react-hook-form';
import Button from '@components/Button';
import { InferProcedures, trpc } from '@utils/trpc';
import TextInput from '@components/Form/TextInput';
import { Fragment, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { RadioGroup } from '@headlessui/react';
import clsx from 'clsx';
import { twGradients } from 'data/gradients';
import { useSession } from 'next-auth/react';

type SettingsUpdateInput = InferProcedures['setting']['update']['input'];
type SettingsOutput = InferProcedures['setting']['get']['output'];

const Settings: NextPage = () => {
  const utils = trpc.useContext();
  const { data } = trpc.setting.get.useQuery(undefined, {
    keepPreviousData: true,
    staleTime: Infinity,
  });

  const updateMutation = trpc.setting.update.useMutation();

  const { register, handleSubmit, reset } = useForm<SettingsUpdateInput>({
    defaultValues: data,
  });

  const onSubmit: SubmitHandler<SettingsUpdateInput> = fieldValues => {
    if (updateMutation.isLoading) return;
    updateMutation.mutate(fieldValues, {
      onSuccess() {
        return utils.setting.invalidate();
      },
    });
  };

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);
  return (
    <>
      <Layout title="Settings">
        <h2 className="text-lg font-bold pb-8">Settings</h2>
        <div className="space-y-12">
          <section className="grid w-full grid-cols-3">
            <div className="col-span-1">
              <h3 className="text-lg font-semibold">Invoice</h3>
              <p className="text-sm">Informations to use on invoice</p>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w-sm space-y-6">
              <TextInput
                register={register}
                name="businessName"
                label="Business name"
              />
              <TextInput
                register={register}
                name="businessEmail"
                label="Business email"
              />
              <TextInput
                register={register}
                name="businessPhone"
                label="Business phone number"
              />
              <TextInput
                register={register}
                name="businessAddress"
                label="Business address"
              />
              <Button
                type="submit"
                variant="primary"
                isLoading={updateMutation.isLoading}
                loadingContent="Saving...">
                Save
              </Button>
            </form>
          </section>
          <TeamSection />
          {data?.access && <AccessSection access={data.access} />}
        </div>
      </Layout>
    </>
  );
};

export default Settings;

const access_data = [
  {
    name: 'Unrestricted',
    value: 'UNRESTRICTED',
    description: 'All people can login with their email',
  },
  {
    name: 'Invite only',
    value: 'INVITE',
    description:
      'Invited email can login via login page or magic link (if still valid)',
  },
];

const TeamSection = () => {
  const utils = trpc.useContext();
  const { data: session } = useSession();
  const { register, handleSubmit } = useForm<{ email: string }>({});
  const { data: teams } = trpc.user.getAll.useQuery();

  return (
    <>
      <section className="w-full grid grid-cols-3">
        <h2 className="col-span-1">Team</h2>
        <div className="w-full max-w-lg  col-span-2 space-y-4">
          <form
            onSubmit={handleSubmit(() => '')}
            className="flex items-center gap-2 ">
            <label htmlFor="email" className="w-full ">
              <input
                type="text"
                placeholder="Email address"
                {...register('email')}
                className="w-full rounded-sm border-gray-300 text-sm"
              />
            </label>
            <Button Icon={PlusIcon}>Add</Button>
          </form>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Members</h3>
            <ul>
              {teams?.map(t => {
                return (
                  <li key={t.id} className="text-sm flex gap-4">
                    <div
                      className={clsx(
                        t.gradient && twGradients[t.gradient],
                        'aspect-square h-8 rounded-full'
                      )}
                    />
                    <p>
                      {t.email}{' '}
                      {t.email === session?.user.email && (
                        <span className="text-gray-400">you</span>
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

const AccessSection = ({ access }: { access: SettingsOutput['access'] }) => {
  const utils = trpc.useContext();
  const accessMutation = trpc.setting.changeAccess.useMutation({
    onSuccess() {
      utils.setting.invalidate();
    },
  });

  return (
    <section className="w-full grid grid-cols-3">
      <h2 className="col-span-1">Access</h2>
      <RadioGroup
        value={access}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(val: any) => accessMutation.mutate({ access: val })}
        className="col-span-2 max-w-lg">
        <RadioGroup.Label className="sr-only">Access</RadioGroup.Label>
        <div className="w-full flex-col ">
          {access_data.map(data => {
            return (
              <RadioGroup.Option
                key={data.value}
                value={data.value}
                className={({ checked }) =>
                  clsx(
                    'p-4 gap-3 ring-1 first:rounded-t last:rounded-b flex ring-gray-300 cursor-pointer',
                    checked && 'bg-[#f1f9ff]'
                  )
                }>
                {({ checked }) => {
                  return (
                    <Fragment>
                      <input
                        type="radio"
                        value={data.value}
                        checked={checked}
                        className=""
                      />
                      <div className="text-sm space-y-1">
                        <RadioGroup.Label as="p" className="leading-none">
                          {data.name}
                        </RadioGroup.Label>
                        <RadioGroup.Description
                          as="p"
                          className="text-gray-500">
                          {data.description}
                        </RadioGroup.Description>
                      </div>
                    </Fragment>
                  );
                }}
              </RadioGroup.Option>
            );
          })}
        </div>
      </RadioGroup>
    </section>
  );
};
