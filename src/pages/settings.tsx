import type { NextPage } from 'next';
import Layout from '@components/Layout';
import { SubmitHandler, useForm } from 'react-hook-form';
import Button from '@components/Button';
import { InferProcedures, trpc } from '@utils/trpc';
import TextInput from '@components/Form/TextInput';

type SettingsOutput = InferProcedures['setting']['get']['output'];
type SettingsUpdateInput = InferProcedures['setting']['update']['input'];

const Settings: NextPage = () => {
  const { data } = trpc.setting.get.useQuery();
  const updateMutation = trpc.setting.update.useMutation();

  const { register, handleSubmit } = useForm<SettingsOutput>({
    defaultValues: data,
  });

  const onSubmit: SubmitHandler<SettingsOutput> = fieldValues => {
    updateMutation.mutate(fieldValues);
  };

  return (
    <>
      <Layout title="Settings">
        <h2 className="text-lg font-bold pb-8">Settings</h2>
        <section className="grid w-full grid-cols-3">
          <div className="col-span-1">
            <h3 className="text-2xl font-semibold">Invoice</h3>
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
            <Button type="submit" variant="primary">
              Save
            </Button>
          </form>
        </section>
      </Layout>
    </>
  );
};

export default Settings;
