import type { NextPage } from 'next';
import Layout from '@components/Layout';
import { SubmitHandler, useForm } from 'react-hook-form';
import Button from '@components/Button';
import { InferProcedures, trpc } from '@utils/trpc';
import TextInput from '@components/Form/TextInput';
import { useEffect } from 'react';

type SettingsUpdateInput = InferProcedures['setting']['update']['input'];

const Settings: NextPage = () => {
  const utils = trpc.useContext();
  const { data } = trpc.setting.get.useQuery(undefined, {
    keepPreviousData: true,
    staleTime: Infinity,
  });
  const updateMutation = trpc.setting.update.useMutation();

  const { register, handleSubmit, reset, formState } =
    useForm<SettingsUpdateInput>({
      defaultValues: data,
    });

  const onSubmit: SubmitHandler<SettingsUpdateInput> = fieldValues => {
    if (updateMutation.isLoading || !formState.isDirty) return;
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
        <section className="grid w-full grid-cols-3">
          <div className="col-span-1">
            <h3 className="text-2xl font-semibold">Invoice</h3>
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
      </Layout>
    </>
  );
};

export default Settings;
